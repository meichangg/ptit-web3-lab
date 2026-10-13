import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.min.css'
import {
  isWallectConnected,
  refreshData,
} from './Blockchain.services'
import Header from './components/Header'
import { useGlobalState } from './store'
import Home from './views/Home'
import Proposal from './views/Proposal'

const App = () => {
  const [loaded, setLoaded] = useState(false)
  const [connectedAccount] = useGlobalState('connectedAccount')
  const [noMetamask] = useGlobalState('noMetamask')

  useEffect(() => {
    const init = async () => {
      await isWallectConnected()
      await refreshData()
      setLoaded(true)
    }
    init()
  }, [])

  // Cap nhat "realtime": doc lai blockchain moi 10 giay de thay phieu/de xuat
  // cua cac ban khac trong nhom ma khong can tai lai trang
  useEffect(() => {
    if (!connectedAccount) return
    const timer = setInterval(refreshData, 10000)
    return () => clearInterval(timer)
  }, [connectedAccount])

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-[#212936] dark:text-gray-300">
      <Header />
      {noMetamask ? (
        <p className="p-8 text-red-600 font-semibold">
          Vui lòng cài MetaMask để sử dụng ứng dụng:{' '}
          <a className="underline" href="https://metamask.io/download/" target="_blank" rel="noreferrer">
            metamask.io/download
          </a>
        </p>
      ) : loaded && !connectedAccount ? (
        <p className="p-8">
          Bấm <strong>Connect Wallet</strong> ở góc trên bên phải để kết nối ví MetaMask (mạng Sepolia).
        </p>
      ) : loaded ? (
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/proposal/:id" element={<Proposal />} />
        </Routes>
      ) : null}

      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  )
}

export default App
