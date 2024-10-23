
import sha3 from "js-sha3"

export function getHashSum(content: string) {
    return content === "" ? "" : sha3.sha3_512(content)
}