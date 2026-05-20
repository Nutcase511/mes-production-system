import React from "react"
import { useUser, type UserInfo } from "@airiot/client"

type Permission = string | string[] | ((user: UserInfo) => boolean)

type FailureComponent =
  | React.ReactNode
  | React.ComponentType
  | string

interface HasPermissionProps {
  permission?: Permission
  failureComponent?: FailureComponent
  children: React.ReactElement
}

function checkPermission(user: UserInfo | undefined, permission: Permission): boolean {
  if (!user) return false
  if (user.isSuper) return true
  if (!user.permissions) return false

  if (Array.isArray(permission)) {
    return permission.every((p) => user.permissions!.includes(p))
  }
  if (typeof permission === "function") {
    return permission(user)
  }
  return user.permissions.includes(permission)
}

function renderFailure(FailureComponent: FailureComponent): React.ReactNode {
  if (React.isValidElement(FailureComponent)) {
    return FailureComponent
  }
  if (typeof FailureComponent === "function") {
    return <FailureComponent />
  }
  return FailureComponent
}

export function HasPermission({
  permission,
  failureComponent = "NoPermission",
  children,
  ...props
}: HasPermissionProps & Record<string, unknown>): React.ReactElement {
  const { user } = useUser()
  // console.log("User permissions:", user)
  if (!permission || checkPermission(user, permission)) {
    return Object.keys(props).length > 0
      ? React.cloneElement(children, props)
      : children
  }

  return renderFailure(failureComponent) as React.ReactElement
}
