module.exports = async function ({ ethers, deployments, getNamedAccounts }) {

  function encodeParameters(types, values) {
    const abi = new ethers.utils.AbiCoder()
    return abi.encode(types, values)
  }

  const { deploy } = deployments

  const { deployer, dev } = await getNamedAccounts()
  const [ deployerSigner, devSigner ] = await ethers.getSigners()


  const txOptions = {
    gasPrice: 1050000000,
    gasLimit: 5000000,
  }

  const rewarderContract = await ethers.getContract("AfricaUniteRewarder")
  console.log("dev:                ", dev);
  console.log("deployer:           ", deployer);
  console.log("rewarderContract.owner(): ", (await rewarderContract.owner()));
  console.log("rewarderContract.rewardToken(): ", (await rewarderContract.rewardToken()));
  console.log("rewarderContract.address: ", (await rewarderContract.address));

  // const rewardPerSecond = '267918000000000000000000';
  // const rewardPerSecond = '133959000000000000000000';
  const rewardPerSecond = '66979000000000000000000';

  let rewardPerSecond2 = await rewarderContract.rewardPerSecond();
  console.log("rewardPerSecond2: ", rewardPerSecond2.toString());

  await (await rewarderContract.connect(devSigner).setRewardPerSecond(rewardPerSecond, txOptions)).wait()

  rewardPerSecond2 = await rewarderContract.rewardPerSecond();
  console.log("rewardPerSecond2: ", rewardPerSecond2.toString());

}

module.exports.tags = ["AfricaUniteRewarderFix"]
module.exports.dependencies = ["AfricaUniteRewarder"]
