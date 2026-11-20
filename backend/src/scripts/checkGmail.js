import '../config/environment.js'
import { verifyGmailConnection } from '../services/emailService.js'

const result = await verifyGmailConnection()
console.log(result.message)

if (result.diagnosticCode) {
  console.log(`Código técnico: ${result.diagnosticCode}`)
}

if (result.status !== 'connected') {
  process.exitCode = 1
}
