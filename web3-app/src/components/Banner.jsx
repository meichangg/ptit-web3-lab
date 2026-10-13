import { useState } from 'react'
import { useGlobalState, setGlobalState, getGlobalState } from '../store'
import { toast } from 'react-toastify'
import { performContribute, getEthBalance } from '../Blockchain.services'

const Banner = () => {
  const [isStakeholder] = useGlobalState('isStakeholder')
  const [proposals] = useGlobalState('proposals')
  const [balance] = useGlobalState('balance')
  const [mybalance] = useGlobalState('mybalance')
  const [amount, setAmount] = useState('')

  const onPropose = () => {
    if (!isStakeholder) return
    setGlobalState('createModal', 'scale-100')
  }

  const [sending, setSending] = useState(false)
  const [checkAddr, setCheckAddr] = useState('')
  const [checkResult, setCheckResult] = useState('')

  const onContribute = async () => {
    if (!(Number(amount) > 0)) return toast.warning('Nhập số ETH muốn đóng góp (VD: 0.01).')
    const wasStakeholder = isStakeholder
    setSending(true)
    const ok = await performContribute(amount)
    setSending(false)
    if (ok) {
      toast.success(`Đóng góp ${amount} ETH thành công!`)
      setAmount('')
      // Muc 4b: tong dong gop >= 0.01 ETH -> tro thanh Stakeholder
      if (!wasStakeholder && getGlobalState('isStakeholder'))
        toast.success('🎉 Bạn đã trở thành Stakeholder, có thể tạo đề xuất và bỏ phiếu!')
    }
  }

  // Bai thuc hanh: "Kiem tra A da nhan duoc tien chua" -> xem so du ETH cua 1 dia chi
  const onCheckBalance = async () => {
    const addr = checkAddr.trim()
    if (!window.web3?.utils.isAddress(addr)) return toast.warning('Địa chỉ ví không hợp lệ.')
    setCheckResult(`Số dư hiện tại: ${await getEthBalance(addr)} ETH`)
  }

  const opened = () =>
    proposals.filter(
      (proposal) => new Date().getTime() < Number(proposal.duration + '000')
    ).length

  return (
    <div className="p-8">
      <h2 className="font-semibold text-3xl mb-5">
        {opened()} Proposal{opened() == 1 ? '' : 's'} Currently Opened
      </h2>
      <p>
        Current DAO Balance: <strong>{balance} Eth</strong> <br />
        Your contributions:{' '}
        <span>
          <strong>{mybalance} Eth</strong>
          {isStakeholder ? ', and you are now a stakeholder 😊' : null}
        </span>
      </p>
      <hr className="my-6 border-gray-300 dark:border-gray-500" />
      <p>
        {isStakeholder
          ? 'You can now raise proposals on this platform 😆'
          : 'Hey, when you contribute upto 0.01 ether you become a stakeholder 😎'}
      </p>
      <div className="flex flex-row justify-start items-center md:w-1/3 w-full mt-4">
        <input
          type="number"
          className="form-control block w-full px-3 py-1.5
          text-base font-normal text-gray-700
          bg-clip-padding border border-solid border-gray-300
          rounded transition ease-in-out m-0 shadow-md
          focus:text-gray-500 focus:outline-none
          dark:border-gray-500 dark:bg-transparent dark:text-gray-300"
          placeholder="e.g 2.5 Eth"
          onChange={(e) => setAmount(e.target.value)}
          value={amount}
          required
        />
      </div>
      <div
        className="flex flex-row justify-start items-center space-x-3 mt-4"
        role="group"
      >
        <button
          type="button"
          className={`inline-block px-6 py-2.5
          bg-blue-600 text-white font-medium text-xs
          leading-tight uppercase shadow-md rounded-full
          hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700
          focus:shadow-lg focus:outline-none focus:ring-0
          active:bg-blue-800 active:shadow-lg transition
          duration-150 ease-in-out dark:text-blue-500
          dark:border dark:border-blue-500 dark:bg-transparent`}
          data-mdb-ripple="true"
          data-mdb-ripple-color="light"
          onClick={onContribute}
          disabled={sending}
        >
          {sending ? 'Đang chờ MetaMask...' : 'Contribute'}
        </button>

        {isStakeholder ? (
          <button
            type="button"
            className={`inline-block px-6 py-2.5
            bg-blue-600 text-white font-medium text-xs
            leading-tight uppercase shadow-md rounded-full
            hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700
            focus:shadow-lg focus:outline-none focus:ring-0
            active:bg-blue-800 active:shadow-lg transition
            duration-150 ease-in-out dark:text-blue-500
            dark:border dark:border-blue-500 dark:bg-transparent`}
            data-mdb-ripple="true"
            data-mdb-ripple-color="light"
            onClick={onPropose}
          >
            Propose
          </button>
        ) : null}
      </div>

      <hr className="my-6 border-gray-300 dark:border-gray-500" />
      <p className="text-sm">Kiểm tra số dư ví (VD: xem bạn A đã nhận tiền sau Payout chưa):</p>
      <div className="flex flex-row items-center space-x-3 mt-2 md:w-2/3 w-full">
        <input
          type="text"
          className="block w-full px-3 py-1.5 text-sm border border-gray-300 rounded shadow-md
          dark:border-gray-500 dark:bg-transparent dark:text-gray-300"
          placeholder="0x... địa chỉ ví"
          value={checkAddr}
          onChange={(e) => setCheckAddr(e.target.value)}
        />
        <button
          type="button"
          className="px-4 py-2 bg-blue-600 text-white text-xs uppercase rounded-full whitespace-nowrap"
          onClick={onCheckBalance}
        >
          Check balance
        </button>
      </div>
      {checkResult ? <p className="text-sm mt-2 font-semibold">{checkResult}</p> : null}
    </div>
  )
}

export default Banner
