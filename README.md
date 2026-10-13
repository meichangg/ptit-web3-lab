# Bài thực hành Smart Contract & React (Web3) – PTIT

DApp quản trị quỹ chung (DAO) trên mạng thử nghiệm **Ethereum Sepolia**:
thành viên góp ETH để trở thành cổ đông, tạo đề xuất chi tiền, bỏ phiếu trong 5 phút và thanh toán cho người nhận.

| Thành phần | Thư mục | Công nghệ |
|---|---|---|
| Smart contract | [`smartcontract/`](smartcontract) | Solidity 0.8.19, Hardhat |
| Giao diện DApp | [`web3-app/`](web3-app) | React, web3.js, Tailwind CSS |

## Hợp đồng đã deploy (Sepolia)

| Hợp đồng | Địa chỉ |
|---|---|
| DominionDAO | [`0x3555735C2C0c3c7C9f49C0E999d766171e33404F`](https://eth-sepolia.blockscout.com/address/0x3555735C2C0c3c7C9f49C0E999d766171e33404F) |
| FirstSmartContract (Remix) | [`0x980348FAb825B729AbA75af7fbc6024331b08f13`](https://eth-sepolia.blockscout.com/address/0x980348FAb825B729AbA75af7fbc6024331b08f13) |

## Chạy giao diện DApp

Yêu cầu: Node.js, trình duyệt có MetaMask (mạng Sepolia, có SepoliaETH từ faucet).

```bash
cd web3-app
cp .env.example .env      # Windows PowerShell: copy .env.example .env
npm install
npm start                 # mở http://localhost:3000
```

Các chức năng: Connect Wallet · Contribute (≥ 0.01 ETH để thành Stakeholder) · Propose · Vote (ACCEPT / REJECT trong 5 phút) · Payout · Check balance.

> Khi xác nhận giao dịch trong MetaMask, **bỏ tick "Tăng cường bảo vệ"** (enhanced protection) – nếu không giao dịch có thể thất bại.

## Deploy lại hợp đồng (tùy chọn)

```bash
cd smartcontract
cp .env.example .env      # rồi điền PRIVATE_KEY của ví test
npm install
npx hardhat compile
npx hardhat run scripts/deploy_3.js --network sepolia
```

Sau khi deploy, cập nhật `REACT_APP_CONTRACT_ADDRESS` trong `web3-app/.env`
và chép ABI mới từ `smartcontract/artifacts/contracts/DominionDAO.sol/DominionDAO.json` sang `web3-app/src/abis/`.

> **Không bao giờ commit file `.env` chứa private key.** Chỉ dùng ví thử nghiệm cho bài thực hành.

## Nguồn

Mã hợp đồng gốc theo tài liệu thực hành: <https://github.com/VuManh-07/CodeSmartcontractThucHanhPtit>
