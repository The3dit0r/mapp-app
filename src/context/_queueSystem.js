/* eslint-disable react-hooks/rules-of-hooks */
import axios from "axios";
import getEnhanced from "../utilityFunction";

// const ytSearch = require("yt-search");
// const ytdl = require("ytdl-core");
// ! Default source for playFromSource()
const defaultSource = { id: "", title: "", type: "" };

const randomID = (len) => {
  len = Math.round(len);
  let str = "";
  while (len-- > 0) {
    str += String(Math.min(9, Math.floor(Math.random() * 10)));
  }

  return str;
};

const getFailedItems = ({ message = "No message provided" }) => {
  return { failed: true, message: message };
};

function useCustomState(defaultValue) {
  let value = defaultValue;

  function getValue() {
    return value;
  }

  function setValue(newValue) {
    value = newValue;
  }

  return [getValue, setValue];
}

export default class Queue {
  constructor(options) {
    const {
      name = `New queue #${randomID(4)}`,
      loopMode = 0,
      queueMode = 0,
      chaosMode = 0,
      radioBase = {},
      radioItems = [],
      items = [],
      id = randomID(12),
    } = options || {};

    this.name = name;
    this.id = id;

    this.loopMode = loopMode;
    this.chaosMode = chaosMode;
    this.queueMode = queueMode;

    this.queueSourceID = "";
    this.queueSourceTitle = "";
    this.queueSourceUrl = "";
    this.queueSourceType = "queue";

    const [getItems, setItems] = useCustomState([]);
    this.getItems = getItems;
    this.setItems = setItems;

    this.radioBase = radioBase;

    const [getRadioItems, setRadioItems] = useCustomState(radioItems);
    this.getRadioItems = getRadioItems;
    this.setRadioItems = setRadioItems;

    this.eventListener = {
      onname: {},
      onqueue: {},
      onadd: {},
      ontop: {},
      onplay: {},
      onremove: {},
      onskip: {},
      onprev: {},
      onrefresh: {},
      onloop: {},
      onchaos: {},
      onqueuemode: {},
      onradiobase: {},
      onshuffle: {},
      oncurrentchange: {},
      //? Try not to use this
      onlargequeue: {},
      //? Experimental
      onstream: {},
      onseek: {},
      onplaying: {},
      onpaused: {},
      onpp: {},
    };

    this.stream = {
      startsAt: -1,
      pausesAt: -1,
      title: "",
      author: "",
      url: "",
      bitrate: -1,
      duration: -1,
    };

    this.psuedoPlayer = 0;
    this.currentVerificationCode = "";
    this.playing = false;

    this.refreshQueue();
    this.addItems(...items);
  }

  getAvailableEvents() {
    return Object.keys(this.eventListener)
      .filter((a) => ![""].includes(a))
      .map((a) => a.split("on")[1]);
  }

  addEventListener(event = "", listener = () => {}) {
    event = "on" + event;

    if (typeof listener !== "function") {
      // console.log(
      //   new Error("Event listener for " + event + " is not a function")
      // );
    }

    if (!this.eventListener.hasOwnProperty(event)) {
      // console.log(new Error("No event listener for " + event));
    }

    this.eventListener[event][listener.name] = listener;
    return;
  }

  removeEventListener(event = "", listener = () => {}) {
    event = "on" + event;

    if (typeof listener !== "function") {
      // console.log(
      //   new Error("Event listener for " + event + " is not a function")
      // );
    }

    if (!this.eventListener.hasOwnProperty(event)) {
      // console.log(new Error("No event listener for " + event));
    }

    if (this.eventListener[event].hasOwnProperty(event)) {
      delete this.eventListener[event][listener.name];
    }
    return;
  }

  removeAllEventListener(event) {
    event = "on" + event;

    if (!this.eventListener.hasOwnProperty(event)) {
      // console.log(new Error("No event listener for " + event));
    }

    this.eventListener[event] = [];
    console.warn("All event listeners removed from " + event);
    return;
  }

  emitEvent(event, data) {
    if (!this.eventListener.hasOwnProperty(event)) {
      // console.log(new Error("No event listener for " + event));
    }

    Object.keys(this.eventListener[event]).forEach((e) => {
      const emitter = this.eventListener[event][e];
      if (typeof emitter === "function") {
        emitter(data);
      }
    });
  }

  /**
   * ?Change queue's name
   * @param {String} newName Queue's new name
   * @returns {Objecyt}
   */
  changeName(newName) {
    if (typeof newName === "string") {
      this.name = newName;

      //* Event listener
      this.emitEvent("onname", newName);

      return this.name;
    }

    return getFailedItems("An error has occured change queue's name.");
  }

  /**
   * ?Get track list (queue + source)
   * !Not to be mistaken with getMainQueue()
   * @returns {Array}
   */
  getQueue() {
    if (this.queueMode === 1) {
      return [...this.getRadioItems()];
    } else {
      return [...this.getItems()];
    }
  }

  /**
   * ?Get MAIN QUEUE list (queue only)
   * !Not to be mistaken with getQueue()
   * @returns {Array}
   * @deprecated !DO NOT USE
   */
  getMainQueue() {
    return this.getQueue().filter((i) => i.sourceID === "");
  }

  /**
   * ?Get SOURCE list (source only)
   * !Not to be mistaken with getQueue()
   * @returns {Array}
   * @deprecated !DO NOT USE
   */
  getMainSource() {
    return this.getQueue().filter((i) => i.sourceID !== "");
  }

  /**
   * ?Get current queue + source queue length
   * @returns {Number} Current length
   */
  getLength() {
    return this.getQueue().length;
  }

  /**
   * ?Get current queue length
   * !This will ignore tracks with sourceID
   * @returns {Number}
   * @deprecated !DO NOT USE
   */
  getQueueLength() {
    return this.getMainQueue().length;
  }

  /**
   * ?Get current queue length
   * !This will ignore tracks without sourceID
   * @returns {Number}
   * @deprecated !DO NOT USE
   */
  getSourceLength() {
    return this.getMainSource().length;
  }

  /**
   * Patch / fix queue from
   * @param {Array} queueContent Queue content
   * @param {Boolean} skipCurrent Skip the current song?
   * @returns {Array}
   */
  queuePatching(queueContent = [], skipCurrent = false) {
    if (queueContent.length === 0) return [];

    // // console.log(queueContent);

    const target = queueContent.slice(1, Infinity);
    const queued = target.filter((item) => item.queued);
    let playlist = target.filter((item) => !item.queued);

    const current = queueContent[0];

    if (this.chaosMode) {
      queued.sort(() => Math.random() - 0.5);
    } else {
      // queued.sort((a, b) => (a.queuedTimestamp > b.queuedTimestamp ? 1 : -1));
    }

    if (this.chaosMode) {
      playlist.sort(() => Math.random() - 0.5);
    } else {
      const cIndex = current.queued ? -1 : current?.sourceIndex;
      const fSectIndexOffset = skipCurrent ? 1 : 0;

      const fSect = playlist
        .filter((a) => a.sourceIndex < cIndex + fSectIndexOffset)
        .sort((a, b) => (a.sourceIndex > b.sourceIndex ? 1 : -1));

      const sSect = playlist
        .filter((a) => a.sourceIndex > cIndex)
        .sort((a, b) => (a.sourceIndex > b.sourceIndex ? 1 : -1));

      playlist = [...sSect, ...fSect];
    }

    const final = [...queued, ...playlist];
    if (!skipCurrent) final.unshift(current);

    return final;
  }

  /**
   * ?Set queue function
   * @returns {Function}
   */
  setQueue(items) {
    const filtered = this.queuePatching(
      items.filter((a) => a),
      false
    );
    const prevLen = this.getLength() === 0 ? true : false;
    // // console.log(this.getQueue());

    if (this.queueMode === 1) {
      this.setRadioItems(filtered);
    } else {
      this.setItems(filtered);
    }

    if (prevLen) this.emitEvent("oncurrentchange", filtered[0]);
    this.emitEvent("onlargequeue", filtered);
  }

  /**
   * ?Get current tracks
   * @returns {Object}
   */
  getCurrent() {
    const queue = this.getQueue();
    return queue[0];
  }

  /**
   * ?Get track with provided index
   * @param {Number} index Item's index in queue
   * @returns {Object}
   */
  getItem(index) {
    const queue = this.getQueue();
    return queue[index] || {};
  }

  /**
   * ?Change queue chaos mode
   * * 0: Disable, 1: Enable
   * @param {Number} force Force mode
   * @returns {Number}
   */
  toggleChaosMode(force) {
    force = Number(force);

    if (isNaN(force)) {
      force = this.chaosMode === 1 ? 0 : 1;
    } else {
      force = Number(Boolean(force));
    }

    this.chaosMode = force;
    //* Hot reload queue
    this.setItems(this.getQueue());

    //* Event listener
    this.emitEvent("onchaos", this.chaosMode);
    this.emitEvent("onlargequeue", this.getQueue());
    return this.chaosMode;
  }

  /**
   * ?Change queue loop mode
   * * 0: Disabled, 1: Queue, 2: Single
   * @param {Number} force Force loop mode
   */
  toggleLoopMode(force) {
    force = Number(force);

    if (isNaN(force)) {
      force = this.loopMode < 2 ? this.loopMode + 1 : 0;
    } else {
      force = Math.min(2, Math.max(0, force));
    }

    this.loopMode = force;

    //* Event listener
    this.emitEvent("onloop", this.loopMode);

    return this.loopMode;
  }

  /**
   * ?Add tracks to queue
   * @param  {...any} items Tracks
   * @returns {...any}
   */
  addItems(...items) {
    const all = Object.assign([], this.getQueue());

    const current = all.shift();
    const queue = all.filter((i) => i.queued);
    const source = all.filter((i) => !i.queued);

    const newList = items.map((item, index) => {
      const newItem = { ...item };

      // newItem.queue = true;
      // newItem.queueIndex = index + qLength;
      newItem.queued = true;
      newItem.queuedTimestamp = new Date().getTime() + index;

      return newItem;
    });
    queue.push(...newList);

    this.setQueue([current, ...queue, ...source]);

    //* Event listener
    this.emitEvent("onadd", newList);

    return this.getQueue();
  }

  /**
   * ?Add tracks to TOP of queue
   * @param  {...any} items Tracks
   * @returns {...any}
   */
  topItems(...items) {
    const all = Object.assign([], this.getQueue());

    const current = all.shift();
    const queue = all.filter((i) => i.queued);
    const source = all.filter((i) => !i.queued);

    const newList = items.map((item, index) => {
      const newItem = { ...item };

      // newItem.queue = true;
      // newItem.queueIndex = index + qLength;
      newItem.queued = true;
      newItem.queuedTimestamp = new Date().getTime() + index;

      return newItem;
    });
    queue.unshift(...newList);

    this.setQueue([current, ...queue, ...source]);

    //* Event listener
    this.emitEvent("ontop", items);

    return this.getQueue();
  }

  /**
   * ?Play ONE SINGULAR TRACK ONLY
   * ! NOT TO BE CONFUSED WITH playItemsFromSource()
   * @param  {...any} items Tracks
   * @returns {any}
   */
  playItem(item) {
    const newQueue = this.getQueue();
    const newItem = { ...item };

    newItem.queued = true;
    newItem.quededTimestamp = new Date().getTime();

    newQueue.unshift(newItem);
    this.setQueue(newQueue);

    //* Event listener
    this.emitEvent("onplay", item);
    this.emitEvent("oncurrentchange", this.getCurrent());

    return this.getQueue();
  }

  /**
   * ?Play track(s) from a source
   * !WILL REPLACE ALL CURRENT TRACKS
   * @param {Array} items Tracks
   * @param {String} sourceID Source ID
   */
  playItemsFromSource(items = [], source = defaultSource, startIndex = 0) {
    const newList = items.map((item, index) => {
      const newItem = Object.assign({}, item);
      newItem.sourceID = source.id;
      newItem.sourceTitle = source.title;

      if (isNaN(item.sourceIndex)) {
        newItem.sourceIndex = index;
      }

      return newItem;
    });

    this.setQueue(newList);
    this.skipNext(startIndex);

    this.queueSourceID = source.id;
    this.queueSourceTitle = source.title;
    this.queueSourceUrl = source.id
      ? `/${source.type.toLowerCase()}/${source.id}`
      : "";
    this.queueSourceType = source.type;

    this.emitEvent("oncurrentchange", this.getCurrent());
  }

  shuffleItems(a) {
    const newQueue = this.getQueue();
    const current = newQueue.shift();

    a = Math.min(100, Math.max(10, a));
    while (a-- > 0) {
      newQueue.sort(() => Math.random() - 0.5);
    }

    newQueue.unshift(current);
    this.setQueue(newQueue);

    //* Event listener
    this.emitEvent("onshuffle", this.getQueue());

    return this.getQueue();
  }

  removeItems(...indexes) {
    const newQueue = this.getQueue();
    const maxIndex = newQueue.length;
    const removed = [];

    for (let i = 0; i < indexes.length; i++) {
      const index = indexes[i];

      if (index > -1 && index < maxIndex) {
        const t = newQueue.splice(index, 1, 0)[0];

        t.index = index;
        removed.push(t);
      }
    }

    //* Event listener
    this.emitEvent("onremove", removed);

    this.setQueue(newQueue.filter((a) => a !== 0));
  }

  /**
   * Move item
   * @param {Number} tIndex Target index
   * @param {Number} dIndex Destination index
   * @returns {Object}
   */
  moveItem(tIndex, dIndex) {
    const newQueue = this.getQueue();

    tIndex = Math.min(Math.max(0, Number(tIndex) || 0), newQueue.length - 1);
    dIndex = Math.min(Math.max(0, Number(dIndex) || 0), newQueue.length - 1);

    const target = newQueue.splice(tIndex, 1, 0)[0];
    newQueue.splice(dIndex, 0, target);

    //* Event listener
    this.emitEvent("onmove", {
      target: target,
      tIndex,
      dIndex,
    });

    this.setQueue(newQueue.filter((a) => a !== 0));

    return {
      target: target,
      tIndex,
      dIndex,
    };
  }

  /**
   * ?Skip tracks
   * @param {Number} count
   * @param {Boolean} manual
   * @returns {Array} Skipped tracks
   */
  skipNext(count = 1, manual = false) {
    const newQueue = this.getQueue();
    const skipped = [];

    if (
      !manual &&
      (this.loopMode === 2 || (this.loopMode === 1 && this.getLength() === 1))
    ) {
      this.emitEvent("oncurrentchange", { repeat: true, ...this.getCurrent() });
      return [];
    }

    for (let i = 0; i < count; i++) {
      skipped.push(newQueue.shift());
    }

    if (this.loopMode === 1) {
      newQueue.push(...skipped.filter((a) => true || !a.queued));
    }

    //* Event listener
    this.emitEvent("onskip", count);
    this.emitEvent("oncurrentchange", newQueue[0]);

    this.refreshQueue();
    this.setQueue(newQueue);

    return skipped;
  }

  /**
   * ?Prev tracks
   * @param {Number} count
   * @param {Boolean} _manual
   * @returns {Array} Skipped tracks
   */
  skipPrev(count = 1) {
    const newQueue = this.getQueue();
    const skipped = [];

    for (let i = 0; i < count; i++) {
      const s = newQueue.pop();
      newQueue.unshift(s);
      skipped.push(s);
    }

    //* Event listener
    this.emitEvent("onprev", count);
    this.emitEvent("oncurrentchange", newQueue[0]);

    this.setQueue(newQueue);
    return skipped;
  }

  toggleQueueMode(type = 0) {
    type = Number(type);
    if (isNaN(type)) {
      this.queueMode = type === 0 ? 1 : 0;
    } else {
      this.queueMode = Number(Boolean(type));
    }

    //* Event listener
    this.emitEvent("onqueuemode", this.queueMode);
    this.emitEvent("onqueue", this.getQueue());
    this.emitEvent("oncurrentchange", this.getCurrent());

    return this.queueMode;
  }

  getBaseLength() {
    return Object.keys(this.radioBase).length;
  }

  getBaseTracks() {
    return Object.keys(this.radioBase).map((key) => {
      return this.radioBase[key];
    });
  }

  getTrackSeeds() {
    return this.getBaseTracks().map((t) => t.id);
  }

  getArtistSeeds() {
    return this.getBaseTracks().map((t) => t.artists[0].id);
  }

  setBaseTracks(item) {
    if (this.radioBase[item.id]) {
      return getFailedItems("Track already set as base");
    }

    this.radioBase = {};
    this.radioBase[item.id] = item;

    //* Event listener
    this.emitEvent("onradiobase", this.getBaseTracks());
    this.emitEvent("onqueue", this.getQueue());

    return item;
  }

  // addBaseTracks(item) {
  //   if (this.getBaseLength() === 3) {
  //     return getFailedItems("Failed to add, base has reached max length of 1");
  //   }

  //   if (this.radioBase[item.id]) {
  //     return getFailedItems("Track already exist in base");
  //   }

  //   this.setQueue([item]);

  //   this.radioBase[item.id] = item;

  //   //* Event listener
  //   this.eventListener.onradiobase(this.getBaseTracks());

  //   return item;
  // }

  // removeBaseTracks(id) {
  //   if (!this.radioBase[id]) {
  //     return getFailedItems("Track does not exist in base");
  //   }

  //   const obj = { ...this.radioBase[id] };
  //   delete this.radioBase[id];

  //   //* Event listener
  //   this.eventListener.onradiobase(this.getBaseTracks());

  //   return obj;
  // }

  clearBaseTracks() {
    if (this.getBaseLength()) {
      this.radioBase = {};
      //* Event listener
      this.emitEvent("onradiobase", []);

      return this.radioBase;
    }

    return getFailedItems("Base list is already cleared");
  }

  /**
   * ?Refresh queue (Radio mode)
   * @returns New tracks
   */
  async refreshQueue() {
    const newQueue = this.getQueue();
    const missing = 21 - newQueue.length;

    if (this.queueMode !== 1) {
      return getFailedItems("Radio mode is not enable");
    }

    if (!this.getBaseLength()) {
      return getFailedItems("Radio base is empty");
    }

    const result = await getEnhanced({
      artist_seed: this.getArtistSeeds(),
      track_seed: this.getTrackSeeds(),
      limit: missing,
    });

    //? Event listener - Use onadd
    this.addItems(...result);
    return result;
  }

  seekCurrentTime(time) {
    if (time === 0 || isNaN(time)) return;

    time = Math.round(time);

    //! Offset 2000ms (start - but already applied) + 3000ms (finish)
    this.stream.startsAt -= time; //// + 2000;

    clearTimeout(this.psuedoPlayer);

    const timeLeft =
      this.stream.duration - (new Date().getTime() - this.stream.startsAt);

    this.psuedoPlayer = setTimeout(() => {
      this.skipNext(1, false);
    }, timeLeft + 5000);

    // // console.log(timeLeft + "ms", "+ 3000ms until current song ends");

    this.emitEvent("onseek", {
      inc: time,
      stream: this.stream,
      currentTime: Math.max(0, this.stream.duration - timeLeft - 2000),
    });
  }

  togglePlayPause() {
    // if (this.stream.startsAt < 0) return;

    // if (this.stream.pausesAt < 0) {
    //   this.stream.pausesAt = new Date().getTime();
    //   clearTimeout(this.psuedoPlayer);
    //   this.emitEvent("onpause", this.stream);
    // } else if (this.stream.pausesAt > 0) {
    //   const skipTime = new Date().getTime() - this.stream.pausesAt;
    //   // const theoryTime = new Date().getTime() - this.stream.startsAt;
    //   const amount = 0 - skipTime;

    //   // console.log("Replaying from", amount);
    //   this.seekCurrentTime(amount);
    //   this.stream.pausesAt = -1;
    // }

    const player = document.getElementById("ap2");
    if (player.paused) {
      player.play();
      this.playing = true;

      this.emitEvent("onplaying");
    } else {
      player.pause();
      this.playing = false;

      this.emitEvent("onpaused");
    }

    this.emitEvent("onpp", this.playing);
  }

  async setStreamData({ id = "", repeat = false, current = false }) {
    clearTimeout(this.psuedoPlayer);
    const verCode = id + randomID(16);
    this.currentVerificationCode = verCode;

    this.stream.startsAt = -1;

    if (!id && !current) {
      this.stream = {
        startsAt: -1,
        title: "",
        author: "",
        url: "",
        bitrate: -1,
        duration: -1,
      };
    } else {
      // const { title, artists } = track;

      // const searchTerm =
      //   title +
      //   " - " +
      //   artists
      //     .slice(0, 4)
      //     .map((a) => a.username)
      //     .join(", ");

      // const results = ytSearch(searchTerm);
      if (!repeat) {
        if (current) {
          id = this.getCurrent().id;
          if (!id)
            return console.warn(
              "Failed while setting stream data, no song is in queue"
            );
        }

        try {
          const { author, bitrate, url, title, approxDurationMs } = (
            await axios.get("https://streams.daapi.repl.co/meta/" + id)
          ).data;

          if (verCode !== this.currentVerificationCode) return;

          this.stream.author = author;
          this.stream.bitrate = bitrate;
          this.stream.url = url;
          this.stream.title = title;
          this.stream.duration = Number(approxDurationMs);
        } catch (err) {
          // console.log("Network error, cannot fetch", id);
          return;
        }
        // // console.log(author, bitrate, url, title, approxDurationMs);
      } else {
        // // console.log("Looping");
      }

      //! Offset 2000ms (start) + 3000ms (finish)
      this.stream.startsAt = new Date().getTime() + 2000;
      this.stream.pausesAt = -1;

      this.psuedoPlayer = setTimeout(() => {
        this.skipNext(1, false);
      }, this.stream.duration);
    }
    this.emitEvent("onstream", this.stream);
  }
}
