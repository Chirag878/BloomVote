import BaseDto from "../../../common/dto/base.dto.js";

class LoginDto extends BaseDto {
    static validate(data = {}) {
        return {
            email: this.email(data.email),
            password: this.string(data.password, "password", { min: 6, max: 128 }),
        };
    }
}

export default LoginDto;
