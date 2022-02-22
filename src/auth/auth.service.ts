import { Injectable } from '@nestjs/common'
import { User, Bookmark } from '@prisma/client'

@Injectable()
export class AuthService {

  signin() {
    return { msg: 'I am signin' }
  }

  signup() {
    return { msg: 'I am sigup' }
  }
}
