import i18n from "i18next";
import en_US from "../../shared/i18n/locales/en_US/translation.json";
import { initI18n } from "./i18n";

describe("i18n env is unset", () => {
  beforeEach(() => {
    initI18n()
      .addResources("en-US", "translation", en_US)
  });

  it("translation of key should match", () =>
    expect(i18n.t("Saving")).toBe("Saving"));

});
describe("i18n env is en-US", () => {
  beforeEach(() => {
    initI18n("en-US")
      .addResources("en-US", "translation", en_US)
  });

  it("translation of key should match", () =>
    expect(i18n.t("Saving")).toBe("Saving"));

});

