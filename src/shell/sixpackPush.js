// 6Pack-Push der privaten Shell (fitness-aos). Eigener Service Worker
// /sixpack-messaging-sw.js (Vite-Plugin in vite.config.js) im Scope
// /sixpack-push/, getrennt vom Shell-SW. Die Produkt-Shell (prod/, vitalos-prod)
// reicht das bewusst nicht durch: VAPID-Key und Messaging-SW gehören zu fitness-aos.
import { enableSixpackPush } from '../../6pack-app/push.js'
import { app as firebaseApp, auth, db } from '@cloud/firebase.js'

export const SIXPACK_PUSH_SW_URL = '/sixpack-messaging-sw.js'
export const SIXPACK_PUSH_SW_SCOPE = '/sixpack-push/'

export function enableShellSixpackPush(uid) {
  return enableSixpackPush(uid, {
    firebaseApp,
    db,
    auth,
    serviceWorkerUrl: SIXPACK_PUSH_SW_URL,
    serviceWorkerScope: SIXPACK_PUSH_SW_SCOPE,
  })
}
