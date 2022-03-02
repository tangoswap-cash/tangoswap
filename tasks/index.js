const { task } = require("hardhat/config")

const { ethers: { constants: { MaxUint256 }}} = require("ethers")

task("accounts", "Prints the list of accounts", require("./accounts"))
task("gas-price", "Prints gas price").setAction(async function({ address }, { ethers }) {
  console.log("Gas price", (await ethers.provider.getGasPrice()).toString())
})

task("bytecode", "Prints bytecode").setAction(async function({ address }, { ethers }) {
  console.log("Bytecode", await ethers.provider.getCode(address))
})

task("feeder:feed", "Feed")
.setAction(async function({ feedDev }, { getNamedAccounts, ethers: { BigNumber }, getChainId }) {
  const { deployer, dev } = await getNamedAccounts()

  const feeder = new ethers.Wallet(process.env.FEEDER_PRIVATE_KEY, ethers.provider)

  await (await feeder.sendTransaction({
    to: deployer,
    value: BigNumber.from(1).mul(BigNumber.from(10).pow(18))
  })).wait();
})

task("feeder:return", "Return funds to feeder").setAction(async function({ address }, { ethers: { getNamedSigners } }) {
  const { deployer, dev } = await getNamedSigners()

  await (await deployer.sendTransaction({
    to: process.env.FEEDER_PUBLIC_KEY,
    value: await deployer.getBalance()
  })).wait();

  await (await dev.sendTransaction({
    to: process.env.FEEDER_PUBLIC_KEY,
    value: await dev.getBalance()
  })).wait();
})

task("erc20:approve", "ERC20 approve")
.addParam("token", "Token")
.addParam("spender", "Spender")
.addOptionalParam("deadline", MaxUint256)
.setAction(async function ({ token, spender, deadline }, { ethers: { getNamedSigner } }, runSuper) {
  const erc20 = await ethers.getContractFactory("UniswapV2ERC20")

  const slp = erc20.attach(token)
  if ( ! deadline) {
    deadline = MaxUint256;
  }
  // console.log("MaxUint256: ", MaxUint256)
  // console.log("deadline: ", deadline)
  // console.log("deadline: ", deadline.toString())

  await (await slp.connect(await getNamedSigner("dev")).approve(spender, deadline)).wait()
});

task("misc:get_tester_addr", "...")
.setAction(async function ({ }, { ethers: { getNamedSigner } }, runSuper) {
  const tester = await getNamedSigner("tester");
  console.log(tester);
  console.log("tester: ", tester.address);
});


task("erc20:approve:tester", "ERC20 approve")
.addParam("token", "Token")
.addParam("spender", "Spender")
.addOptionalParam("deadline", MaxUint256)
.setAction(async function ({ token, spender, deadline }, { ethers: { getNamedSigner } }, runSuper) {
  const erc20 = await ethers.getContractFactory("UniswapV2ERC20")

  const slp = erc20.attach(token)
  if ( ! deadline) {
    deadline = MaxUint256;
  }

  await (await slp.connect(await getNamedSigner("tester")).approve(spender, deadline)).wait()
});

task("factory:set-fee-to", "Factory set fee to")
.addParam("address", "Fee To")
.setAction(async function ({ address }, { ethers: { getNamedSigner } }, runSuper) {
  const factory = await ethers.getContract("UniswapV2Factory")
  console.log(`Setting factory feeTo to ${address} address`)
  await (await factory.connect(await getNamedSigner('dev')).setFeeTo(address, {
    gasPrice: 1050000000,
  })).wait()
});

task("factory:get-fee-to", "Factory get fee to")
.setAction(async function ({ address }, { ethers: { getNamedSigner } }, runSuper) {
  const factory = await ethers.getContract("UniswapV2Factory")
  // console.log(`factory: ${factory.address} feeTo: ${await (await factory.connect(await getNamedSigner('dev')).feeTo())}`)

  const feeTo = await factory.feeTo();
  console.log(`factory: ${factory.address} feeTo: ${feeTo}`)

  // const totalAllocPoint = await masterChefV2.totalAllocPoint();
});

task("factory:get-pair", "Factory get pair")
.addParam("tokenA", "Token A")
.addParam("tokenB", "Token B")
.setAction(async function ({ tokenA, tokenB }, { ethers: { getNamedSigner } }, runSuper) {
  const factory = await ethers.getContract("UniswapV2Factory")
  if (parseInt(tokenA.substring(2, 8), 16) > parseInt(tokenB.substring(2, 8), 16)) {
    [tokenA, tokenB] = [tokenB, tokenA]
  }
  console.log(`${await (await factory.connect(await getNamedSigner('dev')).getPair(tokenA, tokenB))}`)
});

task("factory:query", "Get pair code hash")
.setAction(async function ({ }, { ethers: { getNamedSigner } }, runSuper) {
  const factory = await ethers.getContract("UniswapV2Factory")
  console.log('address', factory.address)
  console.log('feeTo', await (await factory.connect(await getNamedSigner('dev')).feeTo()))
  console.log('feeToSetter', await (await factory.connect(await getNamedSigner('dev')).feeToSetter()))
  console.log('migrator', await (await factory.connect(await getNamedSigner('dev')).migrator()))
  console.log('pairCodeHash', await factory.pairCodeHash())
  console.log('allPairsLength', (await factory.allPairsLength()).toString())
});

// TODO: Swap?

// TODO: Test
task("router:add-liquidity", "Router add liquidity")
.addParam("tokenA", "Token A")
.addParam("tokenB", "Token B")
.addParam("tokenADesired", "Token A Desired")
.addParam("tokenBDesired", "Token B Desired")
.addParam("tokenAMinimum", "Token A Minimum")
.addParam("tokenBMinimum", "Token B Minimum")
.addParam("to", "To")
.addOptionalParam("deadline", MaxUint256)
.setAction(async function ({ tokenA, tokenB, tokenADesired, tokenBDesired, tokenAMinimum, tokenBMinimum, to, deadline }, { ethers: { getNamedSigner } }, runSuper) {
  const router = await ethers.getContract("UniswapV2Router")
  await run("erc20:approve", { token: tokenA, spender: router.address })
  await run("erc20:approve", { token: tokenB, spender: router.address })
  await (await router.connect(await getNamedSigner("dev")).addLiquidity(tokenA, tokenB, tokenADesired, tokenBDesired, tokenAMinimum, tokenBMinimum, to, deadline)).wait()
});

// TODO: Test
task("router:add-liquidity-eth", "Router add liquidity eth")
.addParam("token", "Token")
.addParam("tokenDesired", "Token Desired")
.addParam("tokenMinimum", "Token Minimum")
.addParam("ethMinimum", "ETH Minimum")
.addParam("to", "To")
.addOptionalParam("deadline", MaxUint256)
.setAction(async function ({ token, tokenDesired, tokenMinimum, ethMinimum, to, deadline }, { ethers: { getNamedSigner } }, runSuper) {
  const router = await ethers.getContract("UniswapV2Router")
  await run("erc20:approve", { token, spender: router.address })
  await (await router.connect(await getNamedSigner("dev")).addLiquidityETH(token, tokenDesired, tokenMinimum, ethMinimum, to, deadline)).wait()
});

task("migrate", "Migrates liquidity from BenSwap to SushiSwap")
  .addOptionalParam("a", "Token A", "0xaD6D458402F60fD3Bd25163575031ACDce07538D")
  .addOptionalParam("b", "Token B", "0xc778417E063141139Fce010982780140Aa0cD5Ab")
  .setAction(require("./migrate"))

task("erc20:balance", "Look up balance")
.addParam("address", "Token address")
.addParam("account", "Account")
.setAction(async function ({ address, account }, { ethers: { getNamedSigner } }, runSuper) {
  const erc20 = await ethers.getContractFactory("UniswapV2ERC20")

  const token = erc20.attach(address)

  console.log('balance', (await token.balanceOf(account)).toString())
});

task("pair:query", "Look up pair")
.addParam("address", "Token address")
.setAction(async function ({ address }, { ethers: { getNamedSigner } }, runSuper) {
  const erc20 = await ethers.getContractFactory("UniswapV2Pair")
  const pair = erc20.attach(address)
  const [ reserve0, reserve1, blockTimestampLast ] = await pair.getReserves();

  console.log('factory', await pair.factory());
  console.log('token0', await pair.token0());
  console.log('token1', await pair.token1());
  console.log('reserve0', reserve0.toString());
  console.log('reserve1', reserve1.toString());
  console.log('blockTimestampLast', blockTimestampLast);
  console.log('price0CumulativeLast', (await pair.price0CumulativeLast()).toString());
  console.log('price1CumulativeLast', (await pair.price1CumulativeLast()).toString());
  console.log('kLast', (await pair.kLast()).toString());
});

task("timelock:logs", "Get logs from timelock")
.setAction(async function ({ _ }, { ethers: { getNamedSigner } }, runSuper) {
  const timelock = await ethers.getContract("Timelock")

  const logs = await ethers.provider.getLogs({
    fromBlock: 1027525,
    toBlock: 'latest',
    address: timelock.address,
  })

  for (let log of logs) {
    const parsed = timelock.interface.parseLog(log)
    console.log(`${parsed.name}: ${parsed.args['signature']} contract:${parsed.args[1]} eta:${parsed.args['eta'].toString()} (${Number.parseInt(parsed.args['eta'].toString()) - ((+ new Date)/1000|1000)} away) data:${parsed.args['data']}`)
  }
})

task("masterchef:add", "Add farm to masterchef")
.addParam("alloc", "Allocation Points")
.addParam("address", "Pair Address")
.setAction(async function ({ alloc, address }, { ethers: { getNamedSigner } }, runSuper) {
  const masterChef = await ethers.getContract("MasterChef")

  await (await masterChef.connect(await getNamedSigner("dev")).add(alloc, address, true, {
    gasPrice: 1050000000,
    gasLimit: 5198000,
  })).wait()
});




task("masterchefv2:totalAllocPoint", "Query totalAllocPoint of masterchefv2")
.setAction(async function ({ }, { ethers: { getNamedSigner } }, runSuper) {
  const masterChefV2 = await ethers.getContract("MasterChefV2")

  const totalAllocPoint = await masterChefV2.totalAllocPoint();

  console.log('totalAllocPoint', totalAllocPoint.toString());
});

task("masterchefv2:add", "Add farm to masterchefV2")
.addParam("alloc", "Allocation Points")
.addParam("address", "Pair Address")
.addParam("rewarder", "Rewarder Contract Address")
.setAction(async function ({ alloc, address, rewarder }, { ethers: { getNamedSigner } }, runSuper) {
  const masterChefV2 = await ethers.getContract("MasterChefV2")

  await (await masterChefV2.connect(await getNamedSigner("dev")).add(alloc, address, rewarder, {
    gasPrice: 1050000000,
    gasLimit: 5198000,
  })).wait()
});

task("masterchefv2:harvestFromMasterChef", "Add farm to masterchefV2")
.setAction(async function ({ }, { ethers: { getNamedSigner } }, runSuper) {
  const masterChefV2 = await ethers.getContract("MasterChefV2")

  await (await masterChefV2.connect(await getNamedSigner("dev")).harvestFromMasterChef({
    gasPrice: 1050000000,
    gasLimit: 5198000,
  })).wait()
});

task("masterchefv2:poollen", "Query farm of masterchefv2")
.setAction(async function ({ }, { ethers: { getNamedSigner } }, runSuper) {
  const masterChefV2 = await ethers.getContract("MasterChefV2")

  console.log('address', masterChefV2.address)
  console.log('poolLength', await (await masterChefV2.connect(await getNamedSigner('dev')).poolLength()).toString())
});

task("masterchefv2:farm", "Query farm of masterchefv2")
.addParam("pid", "Pool ID")
.setAction(async function ({ pid }, { ethers: { getNamedSigner } }, runSuper) {
  const masterChefV2 = await ethers.getContract("MasterChefV2")

  const { accSushiPerShare, lastRewardBlock, allocPoint } = await masterChefV2.poolInfo(pid)
  const lpToken = await masterChefV2.lpToken(pid)
  const rewarder = await masterChefV2.rewarder(pid)


  console.log('lpToken', lpToken);
  console.log('rewarder', rewarder);
  console.log('allocPoint', allocPoint.toString());
  console.log('lastRewardBlock', lastRewardBlock.toString());
  console.log('accSushiPerShare', accSushiPerShare.toString());

  const erc20 = await ethers.getContractFactory("UniswapV2Pair")

  const mlp = erc20.attach(lpToken)
  const [ reserve0, reserve1, blockTimestampLast ] = await mlp.getReserves();

  console.log('lp factory', await mlp.factory());
  console.log('lp token0', await mlp.token0());
  console.log('lp token1', await mlp.token1());
  console.log('lp reserve0', reserve0.toString());
  console.log('lp reserve1', reserve1.toString());
  console.log('lp blockTimestampLast', blockTimestampLast);
  console.log('lp price0CumulativeLast', (await mlp.price0CumulativeLast()).toString());
  console.log('lp price1CumulativeLast', (await mlp.price1CumulativeLast()).toString());
  console.log('lp kLast', (await mlp.kLast()).toString());
});

task("masterchefv2:pendingSushi", "Query farm of masterchefv2")
.addParam("pid", "Pool ID")
.addParam("user", "user address")
.setAction(async function ({ pid, user }, { ethers: { getNamedSigner } }, runSuper) {
  const masterChefV2 = await ethers.getContract("MasterChefV2")

  const pending = await masterChefV2.pendingSushi(pid, user)

  console.log('pending: ', pending.toString());
});

task("rewarder:pendingToken", "Query pendingTokens of a Rewarder")
.addParam("rewarder", "Rewarder name")
.addParam("pid", "Pool ID")
.addParam("user", "user address")
.setAction(async function ({ rewarder, pid, user }, { ethers: { getNamedSigner } }, runSuper) {
  // const rewarderContract = await ethers.getContract("MasterChefV2")
  const rewarderContract = await ethers.getContract(rewarder)

  const pending = await rewarderContract.pendingToken(pid, user)

  console.log('pending: ', pending.toString());
});

task("masterchefv2:userInfo", "...")
.addParam("pid", "Pool ID")
.addParam("user", "user address")
.setAction(async function ({ pid, user }, { ethers: { getNamedSigner } }, runSuper) {
  const masterChefV2 = await ethers.getContract("MasterChefV2")

  // mapping (uint256 => mapping (address => UserInfo)) public userInfo;
  const { amount, rewardDebt } = await masterChefV2.userInfo(pid, user)

  console.log('amount:     ', amount.toString());
  console.log('rewardDebt: ', rewardDebt.toString());
});

task("masterchefv2:deposit", "MasterChefV2 deposit")
.addParam("pid", "Pool ID")
.addParam("amount", "Amount")
.addParam("to", "The receiver of `amount` deposit benefit")
.setAction(async function ({ pid, amount, to }, { ethers: { getNamedSigner } }, runSuper) {
  const masterChefV2 = await ethers.getContract("MasterChefV2")

  const lpToken = await masterChefV2.lpToken(pid)
  console.log('lpToken:     ', lpToken);
  console.log('to:          ', to);
  console.log('amount:      ', amount);
  console.log('amount:      ', amount.toString());

  await run("erc20:approve:tester", { token: lpToken, spender: masterChefV2.address })

  // function deposit(uint256 pid, uint256 amount, address to) public {

  // await (await masterChefV2.connect(await getNamedSigner("dev")).deposit(pid, "68533804899529250509", to)).wait()
  // await (await masterChefV2.connect(await getNamedSigner("dev")).deposit(pid, 0, to)).wait()
  await (await masterChefV2.connect(await getNamedSigner("tester")).deposit(pid, amount, to, {
      gasPrice: 1050000000,
      gasLimit: 5198000,
  })).wait()
});

task("masterchefv2:withdraw", "MasterChefV2 withdraw")
.addParam("pid", "Pool ID")
.addParam("amount", "Amount")
.addParam("to", "The receiver of `amount` withdraw benefit")
.setAction(async function ({ pid, amount, to }, { ethers: { getNamedSigner } }, runSuper) {
  const masterChefV2 = await ethers.getContract("MasterChefV2")

  const lpToken = await masterChefV2.lpToken(pid)
  console.log('lpToken:     ', lpToken);
  console.log('to:          ', to);
  console.log('amount:      ', amount);
  console.log('amount:      ', amount.toString());
  console.log("masterChefV2.address: ", (await masterChefV2.address));

  // await run("erc20:approve:tester", { token: lpToken, spender: masterChefV2.address })

  // await (await masterChefV2.connect(await getNamedSigner("dev")).withdraw(pid, "68533804899529250509", to)).wait()
  // await (await masterChefV2.connect(await getNamedSigner("dev")).withdraw(pid, 0, to)).wait()
  await (await masterChefV2.connect(await getNamedSigner("tester")).withdraw(pid, amount, to, {
      gasPrice: 1050000000,
      gasLimit: 5198000,
  })).wait()
});

task("masterchefv2:harvest", "MasterChefV2 harvest")
.addParam("pid", "Pool ID")
.addParam("to", "The receiver of ...")
.setAction(async function ({ pid, to }, { ethers: { getNamedSigner } }, runSuper) {
  const masterChefV2 = await ethers.getContract("MasterChefV2")

  const lpToken = await masterChefV2.lpToken(pid)
  console.log('lpToken:     ', lpToken);
  console.log('to:          ', to);

  await (await masterChefV2.connect(await getNamedSigner("tester")).harvest(pid, to, {
      gasPrice: 1050000000,
      gasLimit: 5198000,
  })).wait()
});


function encodeParameters(types, values) {
  const abi = new ethers.utils.AbiCoder()
  return abi.encode(types, values)
}

function hexToBytes(hex) {
  for (var bytes = [], c = 0; c < hex.length; c += 2)
      bytes.push(parseInt(hex.substr(c, 2), 16));
  return bytes;
}


task("masterchef:pendingSushi", "Query farm of masterchef")
.addParam("pid", "Pool ID")
.addParam("user", "user address")
.setAction(async function ({ pid, user }, { ethers: { getNamedSigner } }, runSuper) {
  const masterChef = await ethers.getContract("MasterChef")

  const pending = await masterChef.pendingSushi(pid, user)

  console.log('pending: ', pending.toString());
});


// task("masterchef:add:is_queued", "?????")
// .addParam("alloc", "Allocation Points")
// .addParam("address", "Pair Address")
// .addParam("eta", "Delay")
// .setAction(async function ({ alloc, address, eta }, { ethers: { getNamedSigner } }, runSuper) {

task("masterchef:add:is_queued", "?????")
  .addParam("txid", "Queued transaction ID")
  .setAction(async function ({ txid }, { ethers: { getNamedSigner } }, runSuper) {
  const masterChef = await ethers.getContract("MasterChef")
  const timelock = await ethers.getContract("Timelock");

  console.log('txid', txid)

  const queued = await timelock.queuedTransactions(txid)

  console.log('queued', queued)

  // 0xaa25702eb3d283bdb34061a407e6033a6ea73ed161d55cb3951fbb2998d12db5





  // function queueTransaction(address target, uint value, string memory signature, bytes memory data, uint eta) public returns (bytes32) {
  //   require(msg.sender == admin, "Timelock::queueTransaction: Call must come from admin.");
  //   require(eta >= getBlockTimestamp().add(delay), "Timelock::queueTransaction: Estimated execution block must satisfy delay.");

  //   bytes32 txHash = keccak256(abi.encode(target, value, signature, data, eta));
  //   queuedTransactions[txHash] = true;

  // let data = encodeParameters(["address", "uint", "string" , "bytes", "uint"], [target, value, signature, data, eta]);






  // let data = encodeParameters(["uint256", "address", "bool"], [alloc, address, false]);
  // console.log(data);
  // data = data.substring(2);
  // console.log(data);
  // data = hexToBytes(data);
  // console.log(data);


  // // const data2 = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(data));
  // // const data2 = ethers.utils.toUtf8Bytes(data);
  // const data2 = ethers.utils.keccak256(data);
  // console.log(data2);

  // bytes32 txHash = keccak256(abi.encode(target, value, signature, data, eta));


  // await (await timelock.connect(await getNamedSigner("dev")).queueTransaction(
  //   masterChef.address,
  //   "0",
  //   "add(uint256,address,bool)",
  //   encodeParameters(["uint256", "address", "bool"], [alloc, address, false]),
  //   eta,
  // {
  //   gasPrice: 1050000000,
  //   gasLimit: 5198000,
  // })).wait()
});

task("masterchef:add:queue", "Add farm to masterchef (timelock queue)")
.addParam("alloc", "Allocation Points")
.addParam("address", "Pair Address")
.addParam("eta", "Delay")
.setAction(async function ({ alloc, address, eta }, { ethers: { getNamedSigner } }, runSuper) {
  const masterChef = await ethers.getContract("MasterChef")

  const timelock = await ethers.getContract("Timelock")
  await (await timelock.connect(await getNamedSigner("dev")).queueTransaction(
    masterChef.address,
    "0",
    "add(uint256,address,bool)",
    encodeParameters(["uint256", "address", "bool"], [alloc, address, false]),
    eta,
  {
    gasPrice: 1050000000,
    gasLimit: 5198000,
  })).wait()
});

task("masterchef:add:execute", "Add farm to masterchef (timelock execute)")
.addParam("alloc", "Allocation Points")
.addParam("address", "Pair Address")
.addParam("eta", "Delay")
.setAction(async function ({ alloc, address, eta }, { ethers: { getNamedSigner } }, runSuper) {
  const masterChef = await ethers.getContract("MasterChef")

  const timelock = await ethers.getContract("Timelock")
  await (await timelock.connect(await getNamedSigner("dev")).executeTransaction(
    masterChef.address,
    "0",
    "add(uint256,address,bool)",
    encodeParameters(["uint256", "address", "bool"], [alloc, address, false]),
    eta,
  {
    gasPrice: 1050000000,
    gasLimit: 5198000,
  })).wait()
});

task("masterchef:add:cancel", "Add farm to masterchef (timelock cancel)")
.addParam("alloc", "Allocation Points")
.addParam("address", "Pair Address")
.addParam("eta", "Delay")
.setAction(async function ({ alloc, address, eta }, { ethers: { getNamedSigner } }, runSuper) {
  const masterChef = await ethers.getContract("MasterChef")

  const timelock = await ethers.getContract("Timelock")
  await (await timelock.connect(await getNamedSigner("dev")).cancelTransaction(
    masterChef.address,
    "0",
    "add(uint256,address,bool)",
    encodeParameters(["uint256", "address", "bool"], [alloc, address, false]),
    eta,
  {
    gasPrice: 1050000000,
    gasLimit: 5198000,
  })).wait()
});


task("masterchef:set", "Set farm allocation points")
.addParam("pid", "Pool Id")
.addParam("alloc", "Allocation Points")
.addOptionalParam("massUpdate", false)
.setAction(async function ({ pid, alloc, massUpdate }, { ethers: { getNamedSigner } }, runSuper) {
  const masterChef = await ethers.getContract("MasterChef")

  await (await masterChef.connect(await getNamedSigner("dev")).set(pid, alloc, massUpdate, {
    gasPrice: 1050000000,
    gasLimit: 5198000,
  })).wait()
});

task("masterchef:set:queue", "Set farm allocation points (timelock queue)")
.addParam("pid", "Pool Id")
.addParam("alloc", "Allocation Points")
.addOptionalParam("massUpdate", false)
.addParam("eta", "Delay")
.setAction(async function ({ pid, alloc, massUpdate, eta }, { ethers: { getNamedSigner } }, runSuper) {
  const masterChef = await ethers.getContract("MasterChef")

  const timelock = await ethers.getContract("Timelock")
  await (await timelock.connect(await getNamedSigner("dev")).queueTransaction(
    masterChef.address,
    "0",
    "set(uint256,uint256,bool)",
    encodeParameters(["uint256", "uint256", "bool"], [pid, alloc, massUpdate]),
    eta,
  {
    gasPrice: 1050000000,
    gasLimit: 5198000,
  })).wait()
});

task("masterchef:set:execute", "Set farm allocation points (timelock execute)")
.addParam("pid", "Pool Id")
.addParam("alloc", "Allocation Points")
.addOptionalParam("massUpdate", false)
.addParam("eta", "Delay")
.setAction(async function ({ pid, alloc, massUpdate, eta }, { ethers: { getNamedSigner } }, runSuper) {
  const masterChef = await ethers.getContract("MasterChef")

  const timelock = await ethers.getContract("Timelock")
  await (await timelock.connect(await getNamedSigner("dev")).executeTransaction(
    masterChef.address,
    "0",
    "set(uint256,uint256,bool)",
    encodeParameters(["uint256", "uint256", "bool"], [pid, alloc, massUpdate]),
    eta,
  {
    gasPrice: 1050000000,
    gasLimit: 5198000,
  })).wait()
});

task("masterchef:set:cancel", "Set farm allocation points (timelock cancel)")
.addParam("pid", "Pool Id")
.addParam("alloc", "Allocation Points")
.addOptionalParam("massUpdate", false)
.addParam("eta", "Delay")
.setAction(async function ({ pid, alloc, massUpdate, eta }, { ethers: { getNamedSigner } }, runSuper) {
  const masterChef = await ethers.getContract("MasterChef")

  const timelock = await ethers.getContract("Timelock")
  await (await timelock.connect(await getNamedSigner("dev")).cancelTransaction(
    masterChef.address,
    "0",
    "set(uint256,uint256,bool)",
    encodeParameters(["uint256", "uint256", "bool"], [pid, alloc, massUpdate]),
    eta,
  {
    gasPrice: 1050000000,
    gasLimit: 5198000,
  })).wait()
});

task("masterchef:poollen", "Query farm of masterchef")
.setAction(async function ({ }, { ethers: { getNamedSigner } }, runSuper) {
  const masterChef = await ethers.getContract("MasterChef")

  console.log('address', masterChef.address)
  console.log('poolLength', await (await masterChef.connect(await getNamedSigner('dev')).poolLength()).toString())
});

task("masterchef:farm", "Query farm of masterchef")
.addParam("pid", "Pool ID")
.setAction(async function ({ pid }, { ethers: { getNamedSigner } }, runSuper) {
  const masterChef = await ethers.getContract("MasterChef")

  const { lpToken, allocPoint, lastRewardBlock, accSushiPerShare } = await masterChef.poolInfo(pid)

  console.log('lpToken', lpToken);
  console.log('allocPoint', allocPoint.toString());
  console.log('lastRewardBlock', lastRewardBlock.toString());
  console.log('accSushiPerShare', accSushiPerShare.toString());

  const erc20 = await ethers.getContractFactory("UniswapV2Pair")

  const mlp = erc20.attach(lpToken)
  const [ reserve0, reserve1, blockTimestampLast ] = await mlp.getReserves();

  console.log('lp factory', await mlp.factory());
  console.log('lp token0', await mlp.token0());
  console.log('lp token1', await mlp.token1());
  console.log('lp reserve0', reserve0.toString());
  console.log('lp reserve1', reserve1.toString());
  console.log('lp blockTimestampLast', blockTimestampLast);
  console.log('lp price0CumulativeLast', (await mlp.price0CumulativeLast()).toString());
  console.log('lp price1CumulativeLast', (await mlp.price1CumulativeLast()).toString());
  console.log('lp kLast', (await mlp.kLast()).toString());
});

task("masterchef:totalAllocPoint", "Query totalAllocPoint of masterchef")
.setAction(async function ({ }, { ethers: { getNamedSigner } }, runSuper) {
  const masterChef = await ethers.getContract("MasterChef")

  const totalAllocPoint = await masterChef.totalAllocPoint();

  console.log('totalAllocPoint', totalAllocPoint.toString());
});

task("masterchef:deposit", "MasterChef deposit")
.addParam("pid", "Pool ID")
.addParam("amount", "Amount")
.setAction(async function ({ pid, amount }, { ethers: { getNamedSigner } }, runSuper) {
  const masterChef = await ethers.getContract("MasterChef")

  const { lpToken } = await masterChef.poolInfo(pid)

  await run("erc20:approve", { token: lpToken, spender: masterChef.address })

  await (await masterChef.connect(await getNamedSigner("dev")).deposit(pid, amount)).wait()
});

task("masterchef:withdraw", "MasterChef withdraw")
.addParam("pid", "Pool ID")
.addParam("amount", "Amount")
.setAction(async function ({ pid, amount }, { ethers: { getNamedSigner } }, runSuper) {
  const masterChef = await ethers.getContract("MasterChef")

  const { lpToken } = await masterChef.poolInfo(pid)

  await run("erc20:approve", { token: lpToken, spender: masterChef.address })

  await (await masterChef.connect(await getNamedSigner("dev")).withdraw(pid, amount)).wait()
});

task("bar:enter", "SushiBar enter")
.addParam("amount", "Amount")
.setAction(async function ({ amount }, { ethers: { getNamedSigner } }, runSuper) {
  const sushi = await ethers.getContract("SushiToken")

  const bar = await ethers.getContract("SushiBar")

  await run("erc20:approve", { token: sushi.address, spender: bar.address })

  await (await bar.connect(await getNamedSigner("dev")).enter(amount)).wait()
});

task("bar:leave", "SushiBar leave")
.addParam("amount", "Amount")
.setAction(async function ({ amount }, { ethers: { getNamedSigner } }, runSuper) {
  const sushi = await ethers.getContract("SushiToken")

  const bar = await ethers.getContract("SushiBar")

  await run("erc20:approve", { token: sushi.address, spender: bar.address })

  await (await bar.connect(await getNamedSigner("dev")).leave(amount)).wait()
});

task("maker:serve", "SushiBar serve")
.setAction(async function ({ a, b }, { ethers: { getNamedSigner } }, runSuper) {
  const factory = await ethers.getContract("UniswapV2Factory")
  const maker = await ethers.getContract("SushiMaker")
  const allPairsLength = Number.parseInt((await factory.allPairsLength()).toString());

  const erc20 = await ethers.getContractFactory("UniswapV2Pair")
  let servedCount = 0;
  for (let i=0; i<allPairsLength; ++i) {
    console.log(`processing pair ${i+1}/${allPairsLength+1}`)
    try {
      const pairAddress = await factory.allPairs(i)
      console.log(`pair: ${pairAddress}`)
      const pair = erc20.attach(pairAddress)

      const balance = await pair.balanceOf(maker.address)
      console.log(balance.toString(), ' balance')
      if (balance.eq(0)) {
          // console.log('0 balance')
          continue
      }

      const totalSupply = await pair.totalSupply();

      if (totalSupply.div(balance).eq(1)) {
          console.log(`balance is entirety of LP`)
          continue
      }

      if (totalSupply.div(balance).gt(10000)) {
          console.log(`${totalSupply.div(balance)} less than 1/10000th of LP`)
          continue
      }


      const a = await pair.token0()
      const b = await pair.token1()
      console.log('tokens: ', a, b)

      const served = await (await maker.connect(await getNamedSigner("dev")).convert(a, b, { gasPrice: 1050000000, gasLimit: 5198000 })).wait()
      console.log('served', served.transactionHash)
      ++servedCount
    } catch (e) {
      console.log(`error encountered: ${JSON.stringify(e)}`)
    }
  }
  console.log(`served ${servedCount} of ${allPairsLength}`)
});

