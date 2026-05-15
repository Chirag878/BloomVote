import BaseDto from "../../../common/dto/base.dto.js";
import { QUIZ_CATEGORIES } from "../../../common/constants.js";

const normalizeQuestionOptions = (dto, options = []) => {
    if (!Array.isArray(options)) dto.fail("options must be an array");
    if (options.length < 2 || options.length > 8) dto.fail("A question must have between 2 and 8 options");

    const normalized = options.map((option, index) => ({
        text: dto.string(option?.text ?? option, `options[${index}]`, { min: 1, max: 250 }),
        isCorrect: dto.boolean(option?.isCorrect, false),
    }));

    if (!normalized.some((option) => option.isCorrect)) {
        dto.fail("At least one option must be marked correct");
    }

    return normalized;
};

class CreateQuizDto extends BaseDto {
    static validate(data = {}) {
        return {
            title: this.string(data.title, "title", { min: 3, max: 200 }),
            description: this.string(data.description, "description", { min: 3, max: 1000 }),
            category: this.enum(data.category, "category", QUIZ_CATEGORIES, "General"),
            timeLimit: this.number(data.timeLimit, "timeLimit", { min: 1, max: 240, fallback: 30 }),
        };
    }
}

class UpdateQuizDto extends BaseDto {
    static validate(data = {}) {
        const payload = {};
        if (data.title !== undefined) payload.title = this.string(data.title, "title", { min: 3, max: 200 });
        if (data.description !== undefined) payload.description = this.string(data.description, "description", { min: 3, max: 1000 });
        if (data.category !== undefined) payload.category = this.enum(data.category, "category", QUIZ_CATEGORIES, "General");
        if (data.timeLimit !== undefined) payload.timeLimit = this.number(data.timeLimit, "timeLimit", { min: 1, max: 240 });
        if (data.isPublished !== undefined) payload.isPublished = this.boolean(data.isPublished);
        return payload;
    }
}

class CreateQuestionDto extends BaseDto {
    static validate(data = {}) {
        return {
            text: this.string(data.text, "text", { min: 3, max: 1000 }),
            options: normalizeQuestionOptions(this, data.options),
            explanation: this.string(data.explanation, "explanation", { max: 1000, required: false }) || "",
            order: this.number(data.order, "order", { min: 1, max: 500 }),
            points: this.number(data.points, "points", { min: 1, max: 100, fallback: 1 }),
        };
    }
}

class SubmitAttemptDto extends BaseDto {
    static validate(data = {}) {
        if (!Array.isArray(data.answers)) this.fail("answers must be an array");

        return {
            answers: data.answers.map((answer, index) => ({
                question: this.objectId(answer.question, `answers[${index}].question`),
                selectedOption: this.objectId(answer.selectedOption, `answers[${index}].selectedOption`),
                timeTaken: this.number(answer.timeTaken, `answers[${index}].timeTaken`, { min: 0, max: 86400, fallback: 0 }),
            })),
        };
    }
}

export { CreateQuizDto, UpdateQuizDto, CreateQuestionDto, SubmitAttemptDto };
