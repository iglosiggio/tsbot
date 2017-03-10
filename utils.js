module.exports = {
  addToProto(ctor, props) {
    for(const prop in props) {
      ctor.prototype[prop] = props[prop];
    }
  }
}
