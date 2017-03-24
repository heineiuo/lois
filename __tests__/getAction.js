const connect = require('../lib').connect;
const bindActionCreators = require('../lib').bindActionCreators;


const hi = (name2) => (ctx, getAction) => {
  return ctx.name+'-'+ctx.name2
};

const hello = (name) => (ctx, getAction) => {
  ctx.name = name;
  const name2 = ctx.name2;
  const actions = getAction();
  const hiName = actions.hi(name2);
  return hiName
};

const connectedHello = connect(bindActionCreators({
  hi: hi
}))(hello);

test('get action', () => {
  const ctx = {name2: 'jack'};
  const {hello} = bindActionCreators({
    hello: connectedHello
  })(ctx);

  const result = hello('john');
  expect(result).toEqual('john-jack')

});