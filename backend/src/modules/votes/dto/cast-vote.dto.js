import BaseDto from "../../../common/dto/base.dto.js";

class CastVoteDto extends BaseDto {
    static validate(data = {}) {
        return {
            pollId: this.objectId(data.pollId, "pollId"),
            optionId: this.objectId(data.optionId, "optionId"),
        };
    }
}

export default CastVoteDto;
