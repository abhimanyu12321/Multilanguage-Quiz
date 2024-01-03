import axios from "axios";
import { generate } from "random-words";
import _ from "lodash";

const generateMCQ = (
  meaning: {
    Text: string;
  }[],
  idx: number
): string[] => {
  const correctAns: string = meaning[idx].Text;
  // An Array with all words except for correct ans
  const allMeaningExceptForCorrect = meaning.filter(
    (i) => i.Text !== correctAns
  );

  // Randomly genrating 3 elements from incorrectArray
  const incorrectOptions: string[] = _.sampleSize(
    allMeaningExceptForCorrect,
    3
  ).map((i) => i.Text);

  const mcqOptions = _.shuffle([...incorrectOptions, correctAns]);

  return mcqOptions;
};

export const translateWords = async (params: LangType): Promise<WordType[]> => {
  try {
    const words = generate(8).map((i) => ({
      Text: i,
    }));
    const response = await axios.post(
      "https://microsoft-translator-text.p.rapidapi.com/translate",
      words,
      {
        params: {
          "to[0]": params,
          "api-version": "3.0",
          profanityAction: "NoAction",
          textType: "plain",
        },

        headers: {
          "content-type": "application/json",
          "X-RapidAPI-Key":
            "09aaccd449msh057e2012d266280p197393jsn616ca1c0859d",
          "X-RapidAPI-Host": "microsoft-translator-text.p.rapidapi.com",
        },
      }
    );

    const receive: FetchedDataType[] = response.data;
    const arr: WordType[] = receive.map((i, idx) => {
      const options: string[] = generateMCQ(words, idx);

      return {
        word: i.translations[0].text,
        meaning: words[idx].Text,
        options,
      };
    });

    return arr;
  } catch (e) {
    throw new Error("Some error");
  }
};

export const countMatchingElements = (
  arr1: string[],
  arr2: string[]
): number => {
  if (arr1.length !== arr2.length) throw new Error("Arrays are not equal");

  let matchedCount = 0;

  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] === arr2[i]) matchedCount++;
  }

  return matchedCount;
};

export const fetchAudio = async (
  text: string,
  language: LangType
): Promise<string> => {
  const encodedParams = new URLSearchParams({
    src: text,
    r: "0",
    c: "mp3",
    f: "8khz_8bit_mono",
    b64: "true",
  });

  if (language === "ja") encodedParams.set("hl", "ja-jp");
  else if (language === "es") encodedParams.set("hl", "es-es");
  else if (language === "fr") encodedParams.set("hl", "fr-fr");
  else encodedParams.set("hl", "hi-in");

  const { data }: { data: string } = await axios.post(
    "https://voicerss-text-to-speech.p.rapidapi.com/",
    encodedParams,
    {
      params: { key: "fdf429fe25174ef8a00f0e44dc0c96dd" },
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        "X-RapidAPI-Key": "09aaccd449msh057e2012d266280p197393jsn616ca1c0859d",
        "X-RapidAPI-Host": "voicerss-text-to-speech.p.rapidapi.com",
      },
    }
  );

  return data;
};
