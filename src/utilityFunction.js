import { favorite as data } from "./favorite";

import Axios from "axios";
import Color from "color";
import ContrastColor from "contrast-color";

import { apiUrl } from "./config";

const dataServer = apiUrl;

/**
 * ?Generate data (for testing)
 * @param {Number} num Track count
 * @returns {Array}
 */
function generateData(num) {
  const selected = Object.keys(data)
    .sort(() => Math.random() - 0.5)
    .slice(0, num);

  return selected.map((a) => data[a]);
}

/**
 * ?Gemerate members (for testing)
 * @returns {Array}
 */
function generateMembers() {
  return [
    {
      name: "That one banana",
      join: new Date().getTime(),
      role: 0,
      id: 111122313,
      avatar:
        "https://cdn.discordapp.com/avatars/539784616517566474/1d3817b3ec04a7448d2eff926722a249.webp",
    },
    {
      name: "That apple",
      join: new Date().getTime(),
      role: 1,
      id: 981122313,
      avatar:
        "https://cdn.discordapp.com/avatars/643061304705417217/357b630c6992f8fb3360215c1dc73022.webp",
    },
    {
      name: "Hahahaha funny",
      join: new Date().getTime(),
      role: 1,
      id: 13122313,
      avatar:
        "https://cdn.discordapp.com/avatars/769495876233854997/c7019edc3b3780d19a3decff0a6877d6.webp",
    },
  ];
}

/**
 * ?Gemerate settings (for testing)
 * @returns {Array}
 */
function generateSettings() {
  return {
    stationName: "",
    stationDesc: "",

    maxTrackCount: 200,

    playbackRecordCount: 100,

    queueModifyPerm: 1,
    playbackModifyPerm: 1,
    propertiesModifyPerm: 1,
  };
}

/**
 * ?Get date.toString()
 * @param {Number} int Date (UNIX time format)
 * @returns {String}
 */
function getDate(int) {
  const date = new Date(int);
  const a = [date.getDate() + 1, date.getMonth() + 1];
  const b = [date.getHours(), date.getMinutes()];

  const dd = a[0] < 10 ? "0" + a[0] : a[0];
  const mm = a[1] < 10 ? "0" + a[1] : a[1];
  const yyyy = date.getYear() + 1900 + "";

  const hh = b[0] < 10 ? "0" + b[0] : b[0];
  const ms = b[1] < 10 ? "0" + b[1] : b[1];

  return `[${dd}/${mm}/${yyyy /*.slice(2, 4)*/}] ${hh}:${ms}`;
}

/**
 * ?Generate a random number
 * @param {Number} min Minimum value
 * @param {Number} max Maximum value
 * @returns {Number}
 */
function rng(min, max) {
  return Math.random() * (max - min) + min;
}

export default function getEnhanced(
  artist_seed,
  track_seed,
  limit = 20,
  filter = []
) {
  return new Promise((resolve, reject) => {
    Axios.post(dataServer + "/enhance", {
      track_seeds: track_seed.slice(0, Math.min(3, track_seed.length)),
      artist_seeds: artist_seed
        .filter((a) => a !== "0LyfQWJT6nXafLPZqxe9Of")
        .slice(0, Math.min(3, artist_seed.length)),
      limit: limit,
      filter: filter,
    })
      .then((res) => {
        const { items } = res.data.data;
        const resolve_arr = [items.shift()];
        limit--;

        if (limit === 0) {
          resolve(resolve_arr);
        } else {
          for (let i = 0; i < items.length; i++) {
            let item = items[i];
            if (item.artists.filter((a) => a.id === artist_seed[0]).length) {
              resolve_arr.push(item);
              items.splice(i, 1);
              limit--;
              break;
            }
          }

          while (limit > 0) {
            const index = Math.floor(items.length * Math.random());
            resolve_arr.push(items[index]);
            items.splice(index, 1);
            limit--;
          }

          resolve(resolve_arr);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
}

// * Color * //

/**
 * ? Get color detail from HEX Code
 * @param {String} color Color (HEX code)
 * @returns {Object} Color Object
 */
function getColorFromHex(color = "#555555") {
  color = color.toUpperCase();

  const prColor = Color(color);
  const lightness = prColor.lightness();
  const isDark = prColor.isDark();

  return {
    input: color,
    mainColor:
      lightness > 85
        ? prColor.darken(Math.max((100 - lightness) * 0.1, 0.2)).hex()
        : prColor.hex(),
    backColor: prColor.darken(Math.min(lightness * 0.01, 0.6)).hex(),
    darkColor: prColor.darken(Math.min(lightness * 0.015, 0.7)).hex(),
    foreColor: isDark ? prColor.hex() : prColor.darken(0.2).hex(),
    textColor: new ContrastColor({ bgColor: color }).contrastColor(),
    isDark: isDark,
  };
}

/**
 * ? Get color detail from image url
 * @param {String} color Image URL
 * @returns {Object} Color Object
 */
async function getColorFromUrl(url) {
  return new Promise(async (resolve, reject) => {
    const options = {
      method: "POST",
      url: "https://color.daapi.repl.co/v1",
      headers: { "Content-Type": "application/json" },
      data: { url: url },
    };
    try {
      const { data } = await Axios.request(options);
      resolve(getColorFromHex(data.hex));
    } catch (error) {
      resolve(getColorFromHex());
      // console.error(error);
    }
  });
}

const color = { fromHex: getColorFromHex, fromUrl: getColorFromUrl };

// ? Color ? //

// * Duration Format * //

function durationFormat(d, min = "", sec = "") {
  d = isNaN(Number(d)) ? 0 : Number(d);

  const m = Math.floor(d / 60);
  const s = Math.floor(d - m * 60);

  const mDisplay = m;
  const sDisplay = s < 10 ? "0" + s : s;

  return mDisplay + " " + min + " " + sDisplay + " " + sec;
}

// ? Duration Format ? //

// * Lyrics * //

/**
 * ? Get lyrics V1
 * @param {String} title Track title
 * @param {String} artist Track artist(s)
 * @returns {Object}
 */
function getLyricsV1(title, artist) {
  const search_term = `${artist} - ${title}`;
  // // console.log(search_term);

  return new Promise((resolve, reject) => {
    Axios.post("https://api.blueg15.repl.co/", {
      endpoint: "lyric",
      data: search_term,
    })
      .then((res) => {
        if (!res.data) {
          resolve(0);
        }

        if (!res.data.lyric) {
          resolve(0);
        }

        // // console.log(res.data);
        resolve(res.data.lyric);
      })
      .catch((err) => {
        resolve(0);
      });
  });
}

/**
 * ? Get lyrics V2
 * @param {String} id Track ID
 * @returns {Object}
 */
async function getLyricsV2(id = "") {
  const data = await Axios.get(
    " https://vercel-audio-seven.vercel.app/api?endpoint=lyrics&id=" + id,
    {
      responseType: "json",
    }
  );

  return data.data;
}

const lyrics = { getLyricsV1, getLyricsV2 };

// ? Lyrics ? 1//

// * Storage * //

function getItem(id) {
  try {
    return JSON.parse(localStorage.getItem(id));
  } catch {
    return localStorage.getItem(id);
  }
}

function setItem(id, val) {
  return localStorage.setItem(id, JSON.stringify(val, null, 0));
}

const storage = { getItem, setItem };

// ? Storage ? //

export {
  generateData,
  generateMembers,
  generateSettings,
  getDate,
  rng,
  color,
  lyrics,
  storage,
  getEnhanced,
  durationFormat,
};
