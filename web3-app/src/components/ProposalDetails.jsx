import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
  Tooltip,
} from 'recharts'
import { listVoters, voteOnProposal } from '../Blockchain.services'
import {
  useGlobalState,
  timeRemaining,
  isExpired,
  proposalStatus,
  statusColor,
  truncate,
} from '../store'

const ProposalDetails = () => {
  const { id } = useParams()
  const [proposals] = useGlobalState('proposals')
  const [isStakeholder] = useGlobalState('isStakeholder')
  const [connectedAccount] = useGlobalState('connectedAccount')
  const [hasVoted, setHasVoted] = useState(false)
  const [voting, setVoting] = useState(false)
  const [, setTick] = useState(0)

  // Lay de xuat tu danh sach toan cuc -> tu cap nhat khi blockchain thay doi (moi 10 giay / sau khi vote)
  const proposal = proposals.find((p) => p.id == id)

  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000) // dem nguoc
    return () => clearInterval(timer)
  }, [])

  // Hop dong cam vote 2 lan ("Double voting not allowed") -> kiem tra truoc de an nut
  useEffect(() => {
    listVoters(id).then((votes) =>
      setHasVoted(votes.some((v) => v.voter.toLowerCase() === connectedAccount))
    )
  }, [id, connectedAccount, proposal?.upvotes, proposal?.downvotes])

  if (!proposal) return <p className="p-8">Đang tải đề xuất...</p>

  const status = proposalStatus(proposal)
  const data = [
    { name: 'Voters', Acceptees: proposal.upvotes, Rejectees: proposal.downvotes },
  ]

  const onVote = async (choice) => {
    if (isExpired(proposal)) return toast.warning('Proposal expired!')
    setVoting(true)
    const ok = await voteOnProposal(id, choice)
    setVoting(false)
    if (ok) toast.success(`Vote ${choice ? 'ACCEPT' : 'REJECT'} thành công!`)
  }

  const voteBtn = `inline-block px-6 py-2.5 text-white font-medium text-xs
    leading-tight uppercase rounded-full shadow-md transition duration-150
    ease-in-out disabled:opacity-50`

  return (
    <div className="p-8">
      <h2 className="font-semibold text-3xl mb-5">
        {proposal.title}{' '}
        <span className={`align-middle text-white text-xs rounded-full px-3 py-1 ${statusColor[status]}`}>
          {status}
        </span>
      </h2>
      <p>
        This proposal is to payout <strong>{proposal.amount} Eth</strong> to{' '}
        <strong title={proposal.beneficiary}>{truncate(proposal.beneficiary, 6, 4, 13)}</strong>,
        currently has <strong>{proposal.upvotes + proposal.downvotes} votes</strong> (👍{' '}
        {proposal.upvotes} / 👎 {proposal.downvotes}) and time left:{' '}
        <strong>{timeRemaining(proposal.duration)}</strong>
      </p>
      <hr className="my-6 border-gray-300" />
      <p>{proposal.description}</p>
      <div className="flex flex-row justify-start items-center w-full mt-4 overflow-auto">
        <BarChart width={730} height={250} data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Bar dataKey="Acceptees" fill="#2563eb" />
          <Bar dataKey="Rejectees" fill="#dc2626" />
        </BarChart>
      </div>

      <div className="flex flex-row justify-start items-center space-x-3 mt-4" role="group">
        {!isStakeholder ? (
          <p className="text-sm">Chỉ Stakeholder (đóng góp ≥ 0.01 ETH) mới được bỏ phiếu.</p>
        ) : isExpired(proposal) ? (
          <p className="text-sm">Đã hết thời gian bỏ phiếu.</p>
        ) : hasVoted ? (
          <p className="text-sm">Bạn đã bỏ phiếu cho đề xuất này.</p>
        ) : (
          <>
            <button
              type="button"
              className={`${voteBtn} bg-blue-600 hover:bg-blue-700`}
              disabled={voting}
              onClick={() => onVote(true)}
            >
              Accept
            </button>
            <button
              type="button"
              className={`${voteBtn} bg-red-600 hover:bg-red-700`}
              disabled={voting}
              onClick={() => onVote(false)}
            >
              Reject
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default ProposalDetails
