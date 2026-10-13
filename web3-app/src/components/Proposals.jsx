import Identicon from 'react-identicons'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  truncate,
  useGlobalState,
  timeRemaining,
  isExpired,
  proposalStatus,
  statusColor,
} from '../store'
import { payoutBeneficiary } from '../Blockchain.services'
import { toast } from 'react-toastify'

const Proposals = () => {
  const [data] = useGlobalState('proposals')
  const [isStakeholder] = useGlobalState('isStakeholder')
  // Luu bo loc (All/Open/Closed) thay vi luu danh sach da loc -> khi blockchain
  // cap nhat (moi 10 giay) bang van dung bo loc dang chon
  const [filter, setFilter] = useState('all')
  const [paying, setPaying] = useState(null)
  const [, setTick] = useState(0)

  // Dem nguoc thoi gian con lai moi giay (han vote chi 5 phut)
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(timer)
  }, [])

  const proposals = data.filter((p) =>
    filter === 'open' ? !isExpired(p) : filter === 'closed' ? isExpired(p) : true
  )

  const tabClass = (name, extra) =>
    `px-6 py-2.5 font-medium text-xs leading-tight uppercase border border-blue-600
    transition duration-150 ease-in-out ${extra} ${
      filter === name
        ? 'bg-blue-600 text-white'
        : 'bg-transparent text-blue-600 hover:bg-blue-700 hover:text-white'
    }`

  // Tailwind chi tao class viet day du trong code (khong ghep dong duoc `bg-${color}-600`)
  const btnColor = {
    blue: 'bg-blue-600 hover:bg-blue-700',
    red: 'bg-red-600 hover:bg-red-700',
  }
  const btn = (color) =>
    `rounded-full px-4 py-2 font-medium text-xs leading-tight uppercase
    text-white ${btnColor[color]} transition duration-150 ease-in-out disabled:opacity-50`

  // Muc 4f: chi Stakeholder bam duoc Payout; thanh cong -> thong bao so ETH va nguoi nhan
  const handlePayout = async (proposal) => {
    setPaying(proposal.id)
    const ok = await payoutBeneficiary(proposal.id)
    setPaying(null)
    if (ok)
      toast.success(
        `✅ Payout thành công! ${proposal.amount} ETH đã gửi đến ${truncate(
          proposal.beneficiary, 5, 3, 11
        )}`
      )
  }

  return (
    <div className="flex flex-col p-8">
      <div className="flex flex-row justify-center items-center" role="group">
        <button className={tabClass('all', 'rounded-l-full')} onClick={() => setFilter('all')}>
          All
        </button>
        <button className={tabClass('open', '')} onClick={() => setFilter('open')}>
          Open
        </button>
        <button className={tabClass('closed', 'rounded-r-full')} onClick={() => setFilter('closed')}>
          Closed
        </button>
      </div>

      <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="py-2 inline-block min-w-full sm:px-6 lg:px-8">
          <div className="h-[calc(100vh_-_20rem)] overflow-y-auto shadow-md rounded-md">
            <table className="min-w-full">
              <thead className="border-b dark:border-gray-500">
                <tr>
                  {['Created By', 'Proposal', 'Amount', 'Votes', 'Time Left', 'Status', 'Action'].map(
                    (h) => (
                      <th key={h} scope="col" className="text-sm font-medium px-4 py-4 text-left">
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {proposals.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-sm px-4 py-6 text-center">
                      Chưa có đề xuất nào.
                    </td>
                  </tr>
                ) : null}
                {proposals.map((proposal) => {
                  const status = proposalStatus(proposal)
                  return (
                    <tr key={proposal.id} className="border-b dark:border-gray-500">
                      <td className="text-sm font-light px-4 py-4 whitespace-nowrap">
                        <div className="flex flex-row justify-start items-center space-x-3">
                          <Identicon
                            string={proposal.proposer.toLowerCase()}
                            size={25}
                            className="h-10 w-10 object-contain rounded-full mr-3"
                          />
                          <span>{truncate(proposal.proposer, 4, 4, 11)}</span>
                        </div>
                      </td>
                      <td className="text-sm px-4 py-4 max-w-xs">
                        <p className="font-semibold truncate">{proposal.title}</p>
                        <p className="font-light text-xs truncate">{proposal.description}</p>
                        <p className="font-light text-xs">
                          → {truncate(proposal.beneficiary, 4, 4, 11)}
                        </p>
                      </td>
                      <td className="text-sm px-4 py-4 whitespace-nowrap">
                        {proposal.amount} ETH
                      </td>
                      <td className="text-sm px-4 py-4 whitespace-nowrap">
                        👍 {proposal.upvotes} / 👎 {proposal.downvotes}
                      </td>
                      <td className="text-sm px-4 py-4 whitespace-nowrap">
                        {timeRemaining(proposal.duration)}
                      </td>
                      <td className="text-sm px-4 py-4 whitespace-nowrap">
                        <span className={`text-white text-xs rounded-full px-3 py-1 ${statusColor[status]}`}>
                          {status}
                        </span>
                      </td>
                      <td className="text-sm px-4 py-4 whitespace-nowrap">
                        <div className="flex flex-row items-center space-x-2">
                          <Link to={'/proposal/' + proposal.id} className={btn('blue')}>
                            {isStakeholder && status === 'Pending' ? 'Vote' : 'View'}
                          </Link>
                          {isStakeholder && status === 'Passed' ? (
                            <button
                              className={btn('red')}
                              disabled={paying === proposal.id}
                              onClick={() => handlePayout(proposal)}
                            >
                              {paying === proposal.id ? 'Paying...' : 'Payout'}
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Proposals
