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

  const { address } = await deploy("KthRewarder", {
    from: deployer,
    args: [masterChefV2.address],
    log: true,
    deterministicDeployment: false
  })

  const txOptions = {
    gasPrice: 1050000000,
    gasLimit: 5000000,
  }

  const kthRewarder = await ethers.getContract("KthRewarder")
  console.log("dev:                ", dev);
  console.log("deployer:           ", deployer);
  console.log("kthRewarder.owner(): ", (await kthRewarder.owner()));
  console.log("kthRewarder.rewardToken(): ", (await kthRewarder.rewardToken()));
  console.log("kthRewarder.address: ", (await kthRewarder.address));

  const rewardToken = '0xc70c7718C7f1CCd906534C2c4a76914173EC2c44';
  const owner = dev;
  const rewardPerSecond = '1000000000000000000';
  const masterLpToken =  '0xCFa5B1C5FaBF867842Ac3C25E729Fc3671d27c50';

  let rewardPerSecond2 = await kthRewarder.rewardPerSecond();
  console.log("rewardPerSecond2: ", rewardPerSecond2.toString());

  if (await kthRewarder.rewardToken() === '0x0000000000000000000000000000000000000000') {
    console.log("I have to call init()");

    // (rewardToken, owner, rewardPerSecond, masterLpToken) = abi.decode(data, (IERC20, address, uint256, IERC20));

    const data = encodeParameters(["address", "address", "uint256", "address"], [rewardToken, owner, rewardPerSecond, masterLpToken]);
    console.log("data: ", data);

    rewardPerSecond2 = await kthRewarder.rewardPerSecond();
    console.log("rewardPerSecond2: ", rewardPerSecond2.toString());

    await (await kthRewarder.connect(devSigner).init(data, txOptions)).wait()

    rewardPerSecond2 = await kthRewarder.rewardPerSecond();
    console.log("rewardPerSecond2: ", rewardPerSecond2.toString());

    // function setRewardPerSecond(uint256 _rewardPerSecond) public onlyOwner {
  }
}

module.exports.tags = ["KthRewarder"]
module.exports.dependencies = ["MasterChefV2"]
