import BaseDto from "../../../common/dto/base.dto.js";
import { ROLES } from "../../../common/constants.js";

const normalizeUserName = (value, email) => {
    const fallback = email?.split("@")[0] || "";
    return String(value || fallback)
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, "_")
        .replace(/_+/g, "_")
        .replace(/^_+|_+$/g, "");
};

class RegisterDto extends BaseDto {
    static validate(data = {}) {
        const email = this.email(data.email);
        const userName = normalizeUserName(data.userName || data.name, email);

        if (userName.length < 5 || userName.length > 32) {
            this.fail("userName must be between 5 and 32 characters");
        }

        return {
            userName,
            email,
            password: this.string(data.password, "password", { min: 6, max: 128 }),
            role: ROLES.USER,
        };
    }
}

export default RegisterDto;
