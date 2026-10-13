import Web3 from 'web3'
import { toast } from 'react-toastify'
import { setGlobalState, getGlobalState } from './store'
import abi from './abis/DominionDAO.json'

const { ethereum } = window
// Chi tao Web3 khi trinh duyet co MetaMask (neu khong, new Web3(undefined) lam trang trang loi)
if (ethereum) {
  window.web3 = new Web3(ethereum)
  window.web3 = new Web3(window.web3.currentProvider)
}

const NO_METAMASK = 'Vui lòng cài MetaMask để sử dụng ứng dụng.'

// Sepolia testnet: chainId 11155111 = 0xaa36a7
const SEPOLIA_CHAIN_ID = '0xaa36a7'

const ensureSepolia = async () => {
  const chainId = await ethereum.request({ method: 'eth_chainId' })
  if (chainId !== SEPOLIA_CHAIN_ID) {
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: SEPOLIA_CHAIN_ID }],
    })
  }
}

const connectWallet = async () => {
  if (!ethereum) return toast.error(NO_METAMASK)
  try {
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
    await ensureSepolia()
    setGlobalState('connectedAccount', accounts[0].toLowerCase())
  } catch (error) {
    reportError(error)
  } finally {
    window.location.reload()
  }
}

const isWallectConnected = async () => {
  if (!ethereum) {
    setGlobalState('noMetamask', true)
    return toast.error(NO_METAMASK)
  }
  try {
    const accounts = await ethereum.request({ method: 'eth_accounts' })

    // Doi mang hoac doi tai khoan trong MetaMask -> tai lai trang thai (yeu cau muc 4a)
    window.ethereum.on('chainChanged', () => window.location.reload())
    window.ethereum.on('accountsChanged', () => window.location.reload())

    if (accounts.length) {
      await ensureSepolia()
      setGlobalState('connectedAccount', accounts[0].toLowerCase())
    } else {
      console.log('No accounts found.') // chua ket noi: hien nut Connect Wallet, khong alert
    }
  } catch (error) {
    reportError(error)
  }
}

const getEtheriumContract = async () => {
  const connectedAccount = getGlobalState('connectedAccount')

  if (connectedAccount) {
    const web3 = window.web3
    const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS
    console.log('address:', contractAddress)
    const contract = new web3.eth.Contract(abi.abi, contractAddress)
    return contract
  } else {
    return getGlobalState('contract')
  }
}

const performContribute = async (amount) => {
  try {
    amount = window.web3.utils.toWei(amount.toString(), 'ether')
    const contract = await getEtheriumContract()
    const account = getGlobalState('connectedAccount')

    await contract.methods.contribute().send({ from: account, value: amount })

    await refreshData() // cap nhat daoBalance, so du, quyen stakeholder (khong reload trang)
    return true
  } catch (error) {
    reportError(error)
    return false
  }
}

const getInfo = async () => {
  try {
    if (!ethereum) return

    const contract = await getEtheriumContract()
    const connectedAccount = getGlobalState('connectedAccount')
    const isStakeholder = await contract.methods
      .isStakeholder()
      .call({ from: connectedAccount })
    const balance = await contract.methods.daoBalance().call()
    const mybalance = await contract.methods
      .getBalance()
      .call({ from: connectedAccount })
    setGlobalState('balance', window.web3.utils.fromWei(balance))
    setGlobalState('mybalance', window.web3.utils.fromWei(mybalance))
    setGlobalState('isStakeholder', isStakeholder)
  } catch (error) {
    reportError(error)
  }
}

const raiseProposal = async ({ title, description, beneficiary, amount }) => {
  try {
    amount = window.web3.utils.toWei(amount.toString(), 'ether')
    const contract = await getEtheriumContract()
    const account = getGlobalState('connectedAccount')

    await contract.methods
      .createProposal(title, description, beneficiary, amount)
      .send({ from: account })

    await refreshData() // de xuat moi hien ngay trong danh sach
    return true
  } catch (error) {
    reportError(error)
    return false
  }
}

const getProposals = async () => {
  try {
    if (!ethereum) return

    const contract = await getEtheriumContract()
    const proposals = await contract.methods.getProposals().call()
    setGlobalState('proposals', structuredProposals(proposals))
  } catch (error) {
    reportError(error)
  }
}

const structuredProposals = (proposals) => {
  return proposals
    .map((proposal) => ({
      id: proposal.id,
      amount: window.web3.utils.fromWei(proposal.amount),
      title: proposal.title,
      description: proposal.description,
      paid: proposal.paid,
      passed: proposal.passed,
      proposer: proposal.proposer,
      upvotes: Number(proposal.upvotes),
      downvotes: Number(proposal.downvotes),
      beneficiary: proposal.beneficiary,
      executor: proposal.executor,
      duration: proposal.duration,
    }))
    .reverse()
}

const getProposal = async (id) => {
  try {
    const proposals = getGlobalState('proposals')
    return proposals.find((proposal) => proposal.id == id)
  } catch (error) {
    reportError(error)
  }
}

const voteOnProposal = async (proposalId, supported) => {
  try {
    const contract = await getEtheriumContract()
    const account = getGlobalState('connectedAccount')
    await contract.methods
      .performVote(proposalId, supported)
      .send({ from: account })

    await refreshData() // so phieu cap nhat ngay
    return true
  } catch (error) {
    reportError(error)
    return false
  }
}

const listVoters = async (id) => {
  try {
    const contract = await getEtheriumContract()
    const votes = await contract.methods.getVotesOf(id).call()
    return votes
  } catch (error) {
    reportError(error)
    return []
  }
}

const payoutBeneficiary = async (id) => {
  try {
    const contract = await getEtheriumContract()
    const account = getGlobalState('connectedAccount')
    await contract.methods.payBeneficiary(id).send({ from: account })
    await refreshData() // trang thai de xuat -> Paid, daoBalance giam
    return true
  } catch (error) {
    reportError(error)
    return false
  }
}

// Doc lai du lieu tu blockchain (so du, quyen, danh sach de xuat) ma khong tai lai trang.
// Duoc goi sau moi giao dich va dinh ky (de thay phieu cua cac ban khac trong nhom).
const refreshData = async () => {
  if (!ethereum || !getGlobalState('connectedAccount')) return
  await getInfo()
  await getProposals()
}

// Lay so du ETH cua 1 dia chi (de kiem tra ban A da nhan duoc tien chua)
const getEthBalance = async (address) => {
  const wei = await window.web3.eth.getBalance(address)
  return window.web3.utils.fromWei(wei)
}

const reportError = (error) => {
  console.log(JSON.stringify(error), 'red')
  // Hiện lỗi lên màn hình để dễ biết giao dịch thất bại vì sao
  toast.error(error?.message || 'Transaction failed')
}

export {
  isWallectConnected,
  connectWallet,
  performContribute,
  getInfo,
  raiseProposal,
  getProposals,
  getProposal,
  voteOnProposal,
  listVoters,
  payoutBeneficiary,
  refreshData,
  getEthBalance,
}
