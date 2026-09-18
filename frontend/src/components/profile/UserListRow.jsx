import { Link } from 'react-router-dom'

import { profilePath } from '../../utils/paths'
import { profileLinkState } from '../../utils/publicUser'
import { Avatar } from '../ui/Avatar'
import './UserListRow.css'

export function UserListRow({ person, currentUserId, busy, onToggle }) {
  const name = person.display_name || person.username
  const isSelf = person.id === currentUserId

  return (
    <li className="user-row">
      <Link
        to={profilePath(person.username)}
        state={profileLinkState(person)}
        className="user-row__link"
      >
        <Avatar src={person.avatar} name={name} size={40} />
        <div>
          <strong>{name}</strong>
          <span>@{person.username}</span>
        </div>
      </Link>
      {isSelf ? null : (
        <button
          type="button"
          className={person.is_following ? 'is-following' : ''}
          onClick={() => onToggle(person)}
          disabled={busy}
        >
          {person.is_following ? 'Seguindo' : 'Seguir'}
        </button>
      )}
    </li>
  )
}
