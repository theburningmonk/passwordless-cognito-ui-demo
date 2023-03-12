import { Auth } from 'aws-amplify'

export default async (to, from, next) => {
  const isProtected = to.matched.some(route => route.meta.isProtected)

  const currentUser = await Auth.currentUserInfo()
  if (isProtected && !currentUser) {
    next('/')
    return
  }

  next()
}