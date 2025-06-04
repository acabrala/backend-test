import * as bcrypt from 'bcrypt';

export class HashUtil {
  private static readonly SALT_ROUNDS = 10;

  /**
   * Gera o hash de uma string.
   * @param plainText - A string que será criptografada.
   * @returns O hash gerado.
   */
  static async hash(plainText: string): Promise<string> {
    const salt = await bcrypt.genSalt(this.SALT_ROUNDS);
    return bcrypt.hash(plainText, salt);
  }

  /**
   * Compara uma string com um hash para verificar se são iguais.
   * @param plainText - A string original.
   * @param hash - O hash que será comparado.
   * @returns `true` se forem iguais, caso contrário `false`.
   */
  static async compare(plainText: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plainText, hash);
  }
}
