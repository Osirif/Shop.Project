import axios from 'axios'
import { IAuthRequisites } from '@Shared/types'
import { HOST } from './const'

export async function verifyRequisites(
  requisites: IAuthRequisites
): Promise<boolean> {
  try {
    const { status } = await axios.post(`${HOST}/auth`, requisites)

    return status === 200
  } catch (e) {
    return false
  }
}
