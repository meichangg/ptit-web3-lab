import { useState } from 'react'
import { FaTimes } from 'react-icons/fa'
import { setGlobalState, useGlobalState } from '../store'
import { raiseProposal } from '../Blockchain.services'
import { toast } from 'react-toastify'

const CreateProposal = () => {
  const [createModal] = useGlobalState('createModal')
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [beneficiary, setBeneficiary] = useState('')
  const [description, setDescription] = useState('')

  const [balance] = useGlobalState('balance')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title || !description || !beneficiary || !amount)
      return toast.warning('Vui lòng điền đủ Title, Description, Beneficiary, Amount.')
    // Kiem tra truoc de khong ton phi gas cho giao dich chac chan that bai
    if (!window.web3.utils.isAddress(beneficiary.trim()))
      return toast.warning('Địa chỉ Beneficiary không hợp lệ (dạng 0x... 42 ký tự).')
    if (!(Number(amount) > 0)) return toast.warning('Amount phải lớn hơn 0.')
    if (Number(amount) > Number(balance))
      toast.info(`Lưu ý: quỹ DAO hiện có ${balance} ETH, payout sẽ thất bại nếu quỹ không đủ.`)

    setSubmitting(true)
    const ok = await raiseProposal({ title, description, beneficiary: beneficiary.trim(), amount })
    setSubmitting(false)
    if (ok) {
      toast.success('Tạo đề xuất thành công!')
      closeModal()
    }
  }

  const closeModal = () => {
    setGlobalState('createModal', 'scale-0')
    resetForm()
  }

  const resetForm = () => {
    setTitle('')
    setAmount('')
    setBeneficiary('')
    setDescription('')
  }

  return (
    <div
      className={`fixed top-0 left-0 w-screen h-screen flex items-center
      justify-center bg-black bg-opacity-50 transform z-50
      transition-transform duration-300 ${createModal}`}
    >
      <div className="bg-white dark:bg-[#212936] shadow-xl shadow-[#122643] dark:shadow-gray-500 rounded-xl w-11/12 md:w-2/5 h-7/12 p-6">
        <form className="flex flex-col">
          <div className="flex flex-row justify-between items-center">
            <p className="font-semibold">Create Proposal</p>
            <button
              type="button"
              onClick={closeModal}
              className="border-0 bg-transparent focus:outline-none"
            >
              <FaTimes />
            </button>
          </div>

          <div className="flex flex-row justify-between items-center border border-gray-500 dark:border-gray-500 rounded-xl mt-5">
            <input
              className="block w-full text-sm
              bg-transparent border-0
              focus:outline-none focus:ring-0"
              type="text"
              name="title"
              placeholder="Title"
              onChange={(e) => setTitle(e.target.value)}
              value={title}
              required
            />
          </div>

          <div className="flex flex-row justify-between items-center border border-gray-500 dark:border-gray-500 rounded-xl mt-5">
            <input
              className="block w-full text-sm
              bg-transparent border-0
              focus:outline-none focus:ring-0"
              type="text"
              name="amount"
              placeholder="Amount (ETH), e.g 0.005"
              onChange={(e) => setAmount(e.target.value)}
              value={amount}
              required
            />
          </div>

          <div className="flex flex-row justify-between items-center border border-gray-500 dark:border-gray-500 rounded-xl mt-5">
            <input
              className="block w-full text-sm
              bg-transparent border-0
              focus:outline-none focus:ring-0"
              type="text"
              name="beneficiary"
              placeholder="Beneficiary: địa chỉ ví người nhận (0x...)"
              onChange={(e) => setBeneficiary(e.target.value)}
              value={beneficiary}
              required
            />
          </div>

          <div className="flex flex-row justify-between items-center border border-gray-500 dark:border-gray-500 rounded-xl mt-5">
            <textarea
              className="block w-full text-sm resize-none
              bg-transparent border-0
              focus:outline-none focus:ring-0 h-20"
              type="text"
              name="description"
              placeholder="Description"
              onChange={(e) => setDescription(e.target.value)}
              value={description}
              required
            ></textarea>
          </div>

          <button
            className="rounded-lg px-6 py-2.5 bg-blue-600
            text-white font-medium text-xs leading-tight
            uppercase hover:bg-blue-700 focus:bg-blue-700
            focus:outline-none focus:ring-0 active:bg-blue-800
            transition duration-150 ease-in-out mt-5 disabled:opacity-50"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? 'Đang chờ MetaMask xác nhận...' : 'Create Proposal'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default CreateProposal
