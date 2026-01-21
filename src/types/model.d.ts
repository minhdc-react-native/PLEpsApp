import { LoginType } from "./login-type.enum";

export {};

declare global {
  interface IToken {
    access_token: string;
    refresh_token: string;
  }
  interface ILogin {
    userName: string;
    password: string;
    remember: boolean;
  }
  interface IUser {
    id: string;
    code: string;
    userName: string;
    fullName: string;
    contract: string;
    contractSignedDate: Date;
    gender: number;
    birthDate: Date;
    imageUrl: string;
    email: string;
    positionName: string;
    department: {
      id: string;
      code: string;
      name: string;
      viewName: string | null;
      shortName: string | null;
    };
    team: {
      id: string;
      code: string;
      name: string;
      viewName: string;
      shortName: string;
    };
    position: {
      id: string;
      code: string;
      name: string;
      viewName: string;
      shortName: string;
    };
    area: {
      id: string;
      code: string;
      name: string;
      viewName: string;
      shortName: string;
    };
    rankScale: number;
    accountType: LoginType;
    [key: string]: any;
  }
  interface IDataBase {
    id: string;
    [key: string]: any;
  }
}
