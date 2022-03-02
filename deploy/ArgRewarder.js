module.exports = async function ({ ethers, deployments, getNamedAccounts }) {

  function encodeParameters(types, values) {
    const abi = new ethers.utils.AbiCoder()
    return abi.encode(types, values)
  }

  const { deploy } = deployments

  const { deployer, dev } = await getNamedAccounts()
  const [ deployerSigner, devSigner ] = await ethers.getSigners()

  const masterChefV2 = await ethers.getContract("MasterChefV2");

  console.log("args: ", [masterChefV2.address]);

  const { address } = await deploy("ArgRewarder", {
    from: deployer,
    args: [masterChefV2.address],
    log: true,
    deterministicDeployment: false
  })

  const txOptions = {
    gasPrice: 1050000000,
    gasLimit: 5000000,
  }

  const argRewarder = await ethers.getContract("ArgRewarder")
  console.log("dev:                ", dev);
  console.log("deployer:           ", deployer);
  console.log("argRewarder.owner(): ", (await argRewarder.owner()));
  console.log("argRewarder.rewardToken(): ", (await argRewarder.rewardToken()));
  console.log("argRewarder.address: ", (await argRewarder.address));

  const rewardToken = '0x675E1d6FcE8C7cC091aED06A68D079489450338a';
  const owner = dev;
  const rewardPerSecond = '2342000000000000000000';
  const masterLpToken =  '0xF463db65674426A58E9C3fE557FaaE338026ef39';

  let rewardPerSecond2 = await argRewarder.rewardPerSecond();
  console.log("rewardPerSecond2: ", rewardPerSecond2.toString());

  if (await argRewarder.rewardToken() === '0x0000000000000000000000000000000000000000') {
    console.log("I have to call init()");

    // (rewardToken, owner, rewardPerSecond, masterLpToken) = abi.decode(data, (IERC20, address, uint256, IERC20));

    const data = encodeParameters(["address", "address", "uint256", "address"], [rewardToken, owner, rewardPerSecond, masterLpToken]);
    console.log("data: ", data);

    rewardPerSecond2 = await argRewarder.rewardPerSecond();
    console.log("rewardPerSecond2: ", rewardPerSecond2.toString());

    await (await argRewarder.connect(devSigner).init(data, txOptions)).wait()

    rewardPerSecond2 = await argRewarder.rewardPerSecond();
    console.log("rewardPerSecond2: ", rewardPerSecond2.toString());

    // function setRewardPerSecond(uint256 _rewardPerSecond) public onlyOwner {
  }
}

module.exports.tags = ["ArgRewarder"]
// module.exports.dependencies = ["MasterChefV2"]
