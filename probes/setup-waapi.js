// Minimal Web Animations API stub for jsdom. Mirrors exactly the surface Svelte's
// transition engine touches: animate(), getAnimations(), onfinish, cancel(),
// effect, currentTime, playState. Records every call so probes can assert that
// a transition really was applied to the emplaced node.
const records = [];
globalThis.__animations = records;
globalThis.__resetAnimations = () => (records.length = 0);

class FakeAnimation {
	constructor(el, keyframes, opts = {}) {
		this.el = el;
		this.keyframes = keyframes;
		this.opts = opts;
		this.duration = opts.duration ?? 0;
		this.playState = 'running';
		this.effect = {};
		this.onfinish = null;
		this._start = Date.now();
		this._timer = setTimeout(() => this.finish(), this.duration);
	}
	get currentTime() {
		if (this.playState === 'finished') return this.duration;
		return Math.min(this.duration, Date.now() - this._start);
	}
	finish() {
		if (this.playState !== 'running') return;
		this.playState = 'finished';
		this.onfinish?.();
	}
	cancel() {
		clearTimeout(this._timer);
		this.playState = 'idle';
	}
}

Element.prototype.animate = function (keyframes, opts) {
	const a = new FakeAnimation(this, keyframes, opts);
	records.push(a);
	return a;
};

Element.prototype.getAnimations = function () {
	return records.filter((a) => a.el === this && a.playState === 'running');
};
