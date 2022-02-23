import { ForbiddenException, Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { AuthDto } from './dto/auth.dto'
import * as argon from 'argon2'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime'

@Injectable()
export class AuthService {

  constructor(private prisma: PrismaService){}

  async signup(dto: AuthDto) {
    // generate the password hash
    const hash = await argon.hash(dto.password)
    // save the new user in the db
    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash
        }
      })
      delete user.hash
      // return the new use
      return user
    } catch (error) {
      if(
        error instanceof PrismaClientKnownRequestError && 
        error.code === 'P2002'
      ){
        throw new ForbiddenException('Credentials Taken')
      }
      throw error
    }
  }


  async signin(dto: AuthDto) {
    // find the user by email
    const user = await this.prisma.user.findUnique(({
      where: {
        email: dto.email
      }
    }))
    // if user does not exist throw exception
    if(!user) throw new ForbiddenException('Credentials incorrect')
    // compare password
    const pwMatched = await argon.verify(user.hash, dto.password)
    // if password incorrect therow exception
    if(!pwMatched) throw new ForbiddenException('Credentials incorrect')
    delete user.hash
    // send back the user
    return user
  }
}
