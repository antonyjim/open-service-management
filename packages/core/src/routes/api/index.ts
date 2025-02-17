/**
 * routes.api.index.ts
 * Provide a single route for all api routes and parse appropriate middleware
 */

// Node Modules

// NPM Modules
import { Router, Request, Response } from 'express'
import { sign } from 'jsonwebtoken'

// Local Modules
import { jwtKeys, requireAuthentication } from '../middleware/authentication'
import { adminRoutes } from './admin'
import { login, getToken, sysUser } from '@app/users/login'
import { IStatusMessage } from '@osm/server'
import { jwtSecret } from '@lib/connection'
import { q } from './q'
import * as bodyParser from 'body-parser'
import { UserTypes } from '@osm/users'
import useradminRoutes from './users'
import descriptions from './descriptions'
import { excelRoute } from './excel'
import { getRoleAuthorizedNavigation } from '@app/navigation/navigation'
import { fileRouter } from './fileHandler'
import { ccRoutes } from './customComponents'

// Constants and global variables
const apiRoutes = Router()

apiRoutes.use(requireAuthentication())
apiRoutes.use('/excel', excelRoute)
// apiRoutes.use(apiTokenValidation())
apiRoutes.use('/describe', descriptions)
apiRoutes.use('/q', q) // q is for general api queries
apiRoutes.get('/navigation', (req: Request, res: Response) => {
  getRoleAuthorizedNavigation(req.auth[jwtKeys.user], req.auth[jwtKeys.scope])
    .then((onResolved: IStatusMessage) => {
      res.status(200).json(onResolved)
    })
    .catch((err: IStatusMessage) => {
      res.status(200).json(err)
    })
})
// For now we are just going to go around endpoint authentication
apiRoutes.use('/c', ccRoutes)
apiRoutes.use('/attachments', fileRouter)
apiRoutes.use(bodyParser.json())
apiRoutes.use('/admin', adminRoutes) // admin is for site-administration duties
apiRoutes.use('/users', useradminRoutes) // users is for user administration
apiRoutes.get('/refresh', (req: Request, res: Response) => {
  if (req.auth.iA && req.auth.c) {
    const payload = {
      [jwtKeys.isAuthenticated]: true,
      [jwtKeys.user]: req.auth[jwtKeys.user],
      [jwtKeys.claimLevel]: req.auth[jwtKeys.claimLevel],
      [jwtKeys.claim]: req.auth[jwtKeys.claim]
    }
    sign(
      payload,
      jwtSecret,
      { expiresIn: '5h' },
      (err: Error, token: string) => {
        if (err) res.status(500).end()
        res.status(200).json({
          token,
          error: false,
          message: 'Success'
        })
      }
    )
  } else {
    if (!res.headersSent) {
      res.status(401).json({
        error: true,
        message: 'User is not authenticated'
      })
    } else {
      return 0
    }
  }
})
export { apiRoutes }
