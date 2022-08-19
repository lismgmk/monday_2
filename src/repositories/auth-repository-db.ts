import { collections } from '../connect-db';
import bcrypt from 'bcryptjs';
import { addUserAttempt } from '../utils/add-user-attempt';
import { jwtPassService } from '../utils/jwt-pass-service';
import { usersRepositoryDB } from './users-repository-db';
import { expiredAccess } from '../constants';

export const authRepositoryDB = {
  async authUser(login: string, password: string): Promise<{ accessToken: string } | null> {
    const attemptCountUser = await collections.users?.findOne({ 'accountData.userName': login });
    const isMatch =
      attemptCountUser && (await bcrypt.compare(password, attemptCountUser.accountData.passwordHash ?? ''));
    if (!attemptCountUser || !isMatch) {
      await addUserAttempt.addAttemptByLogin(login, false);
      return null;
    } else {
      await addUserAttempt.addAttemptByLogin(login, true);
      const accessToken = jwtPassService.createJwt(attemptCountUser!._id!, expiredAccess);
      return { accessToken };
    }
  },
  async confirmEmail(code: string) {
    const confirmedUser = await collections.users?.findOne({ 'emailConfirmation.confirmationCode': { $eq: code } });
    if (!confirmedUser) {
      return false;
    }
    if (confirmedUser!.emailConfirmation.isConfirmed === true) {
      return false;
    } else {
      await usersRepositoryDB.confirmUserById(confirmedUser!._id, true);
      return true;
    }
  },
};
