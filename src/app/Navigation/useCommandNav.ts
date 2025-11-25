import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

import { getCommand } from './commandRegistry'

export function useCommandNav() {
  const navigate = useNavigate()

  return useCallback(
    (commandId: string) => {
      const command = getCommand(commandId)
      if (command) {
        navigate(command.path)
      }
    },
    [navigate]
  )
}

