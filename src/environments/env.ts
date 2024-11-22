export interface Environment {
  DB_URL: string;
  jwtSecret: string;
  jwt_timeout: string;
}

export function env(): Environment {
  return {
    DB_URL:process.env.DB_URL,
    jwtSecret:process.env.jwtSecret,
    jwt_timeout:process.env.jwt_timeout
  };
}
