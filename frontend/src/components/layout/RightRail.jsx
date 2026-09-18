import { WhoToFollow } from '../feed/WhoToFollow'
import './RightRail.css'

export function RightRail({ token, currentUserId }) {
  return (
    <aside className="right-rail">
      <WhoToFollow token={token} currentUserId={currentUserId} />
    </aside>
  )
}
