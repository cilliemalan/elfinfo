import request from "supertest";
import * as elfinfo from "../src";

describe("Basic Operations", () => {
    it("should open without problems", async () => {
        let elf = await elfinfo.open("C:\\Projects\\hashtag-iot\\firmware\\build\\bin\\hashtag-iot");
        expect(elf).toBeTruthy();
    });
});
