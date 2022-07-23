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

  const { address } = await deploy("NarathRewarder", {
    from: deployer,
    args: [masterChefV2.address],
    log: true,
    deterministicDeployment: false
  })

  const txOptions = {
    gasPrice: 1050000000,
    gasLimit: 5000000,
  }

  const rewarderContract = await ethers.getContract("NarathRewarder")
  console.log("dev:                ", dev);
  console.log("deployer:           ", deployer);
  console.log("rewarderContract.owner(): ", (await rewarderContract.owner()));
  console.log("rewarderContract.rewardToken(): ", (await rewarderContract.rewardToken()));
  console.log("rewarderContract.address: ", (await rewarderContract.address));




  const rewardToken = '0x0cb20466c0dd6454acf50ec26f3042ccc6362fa0';
  const owner = dev;
  const rewardPerSecond = '925000000000000000000';
  // Narath: 925 per second.
  const masterLpToken =  '0x5109aABC359c5267B6d470f43414319dd8a3C123';

  let rewardPerSecond2 = await rewarderContract.rewardPerSecond();
  console.log("rewardPerSecond2: ", rewardPerSecond2.toString());

  if (await rewarderContract.rewardToken() === '0x0000000000000000000000000000000000000000') {
    console.log("I have to call init()");

    // (rewardToken, owner, rewardPerSecond, masterLpToken) = abi.decode(data, (IERC20, address, uint256, IERC20));

    const data = encodeParameters(["address", "address", "uint256", "address"], [rewardToken, owner, rewardPerSecond, masterLpToken]);
    console.log("data: ", data);

    rewardPerSecond2 = await rewarderContract.rewardPerSecond();
    console.log("rewardPerSecond2: ", rewardPerSecond2.toString());

    await (await rewarderContract.connect(devSigner).init(data, txOptions)).wait()

    rewardPerSecond2 = await rewarderContract.rewardPerSecond();
    console.log("rewardPerSecond2: ", rewardPerSecond2.toString());

    // function setRewardPerSecond(uint256 _rewardPerSecond) public onlyOwner {
  }
}

module.exports.tags = ["NarathRewarder"]
// module.exports.dependencies = ["MasterChefV2"]
