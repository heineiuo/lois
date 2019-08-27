import jwt from 'jsonwebtoken'
import { currentInstance } from "./currentInstance"

export function useSession() {

}


/**
 * express

const app = express()

app.use(sessionMiddleware())

app.use((req, res, next) => {
  console.log(req.session)
})

http.createServer(app).listen()

 */

/**
 * my framework
const app = myFramework()
const { useSession } = myFramework

app.use(function Person(){
  const session = useSession()
  console.log(session)
})

http.createServer(app).listen()
 */
