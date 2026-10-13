import { createGlobalState } from 'react-hooks-global-state'
import moment from 'moment'

const { setGlobalState, useGlobalState, getGlobalState } = createGlobalState({
  createModal: 'scale-0',
  connectedAccount: '',
  contract: null,
  proposals: [],
  isStakeholder: false,
  balance: 0,
  mybalance: 0,
  noMetamask: false,
})

const truncate = (text, startChars, endChars, maxLength) => {
  if (text.length > maxLength) {
    var start = text.substring(0, startChars)
    var end = text.substring(text.length - endChars, text.length)
    while (start.length + end.length < maxLength) {
      start = start + '.'
    }
    return start + end
  }
  return text
}

const daysRemaining = (days) => {
  const todaysdate = moment()
  days = Number((days + '000').slice(0))
  days = moment(days).format('YYYY-MM-DD')
  days = moment(days)
  days = days.diff(todaysdate, 'days')
  return days == 1 ? '1 day' : days + ' days'
}

// Han vote cua hop dong chi 5 phut -> daysRemaining luon ra "0 days".
// Ham nay dem nguoc theo ngay / gio / phut / giay.
const timeRemaining = (duration) => {
  const ms = Number(duration) * 1000 - Date.now()
  if (!duration || ms <= 0) return 'Expired'
  const s = Math.floor(ms / 1000)
  const d = Math.floor(s / 86400)
  const h = Math.floor((s % 86400) / 3600)
  const m = Math.floor((s % 3600) / 60)
  if (d > 0) return `${d}d ${h}h`
  if (h > 0) return `${h}h ${m}m`
  return `${m}m ${String(s % 60).padStart(2, '0')}s`
}

const isExpired = (proposal) => Date.now() >= Number(proposal.duration) * 1000

// Trang thai theo yeu cau bai thuc hanh: Pending / Passed / Not Passed / Paid.
// Hop dong khong luu duoc proposal.passed (bi revert) nen tinh tu thoi han + so phieu.
const proposalStatus = (proposal) => {
  if (proposal.paid) return 'Paid'
  if (!isExpired(proposal)) return 'Pending'
  return proposal.upvotes > proposal.downvotes ? 'Passed' : 'Not Passed'
}

const statusColor = {
  Pending: 'bg-yellow-500',
  Passed: 'bg-blue-600',
  'Not Passed': 'bg-red-600',
  Paid: 'bg-green-600',
}

export {
  truncate,
  setGlobalState,
  useGlobalState,
  getGlobalState,
  daysRemaining,
  timeRemaining,
  isExpired,
  proposalStatus,
  statusColor,
}
