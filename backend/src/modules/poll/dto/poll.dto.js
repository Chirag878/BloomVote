import BaseDto from "../../../common/dto/base.dto.js";
import { POLL_CATEGORIES } from "../../../common/constants.js";

const normalizeOptions = (dto, rawOptions) => {
    if (!Array.isArray(rawOptions)) dto.fail("options must be an array");

    const options = rawOptions.map((option, index) => {
        const text = typeof option === "string" ? option : option?.text;
        return {
            text: dto.string(text, `options[${index}]`, { min: 1, max: 200 }),
        };
    });

    if (options.length < 2 || options.length > 10) {
        dto.fail("A poll must have between 2 and 10 options");
    }

    return options;
};

class CreatePollDto extends BaseDto {
    static validate(data = {}) {
        return {
            question: this.string(data.question, "question", { min: 5, max: 1000 }),
            options: normalizeOptions(this, data.options),
            category: this.enum(data.category, "category", POLL_CATEGORIES, "General"),
            expiresAt: this.date(data.expiresAt, "expiresAt") || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            allowsMultipleVotes: this.boolean(data.allowsMultipleVotes, false),
        };
    }
}

class UpdatePollDto extends BaseDto {
    static validate(data = {}) {
        const payload = {};
        if (data.question !== undefined) payload.question = this.string(data.question, "question", { min: 5, max: 1000 });
        if (data.options !== undefined) payload.options = normalizeOptions(this, data.options);
        if (data.category !== undefined) payload.category = this.enum(data.category, "category", POLL_CATEGORIES, "General");
        if (data.expiresAt !== undefined) payload.expiresAt = this.date(data.expiresAt, "expiresAt");
        if (data.isActive !== undefined) payload.isActive = this.boolean(data.isActive);
        if (data.allowsMultipleVotes !== undefined) payload.allowsMultipleVotes = this.boolean(data.allowsMultipleVotes);
        return payload;
    }
}

export { CreatePollDto, UpdatePollDto };
