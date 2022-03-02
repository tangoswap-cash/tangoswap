
module.exports = async function ({ ethers, deployments, getNamedAccounts }) {
  const { deploy } = deployments

  const { deployer, dev } = await getNamedAccounts()
  const [ deployerSigner, devSigner ] = await ethers.getSigners()

  const sushi = await ethers.getContract("SushiToken")
  const masterChef = await ethers.getContract("MasterChef");
  const masterPID = 31;
  const dummyToken = '0x7d33dB5C9036F1F47Fc41eb0475889D86d0c1ee5'

  console.log("args: ", [masterChef.address, sushi.address, masterPID]);

  const { address } = await deploy("MasterChefV2", {
    from: deployer,
    args: [masterChef.address, sushi.address, masterPID],
    log: true,
    deterministicDeployment: false
  })

  const txOptions = {
    gasPrice: 1050000000,
    gasLimit: 5000000,
  }

  const masterChefV2 = await ethers.getContract("MasterChefV2")
  const masterChefV2Addr = await masterChefV2.address;
  console.log("dev:                  ", dev);
  console.log("deployer:             ", deployer);
  console.log("masterChefV2.owner(): ", (await masterChefV2.owner()));
  console.log("masterChefV2.address: ", masterChefV2Addr);
  console.log("dummyToken:           ", dummyToken);


  // const erc20 = await ethers.getContractFactory("UniswapV2ERC20")
  // const dummyTokenContract = erc20.attach(dummyToken)
  // const deadline = ethers.constants.MaxUint256;
  // let allowance = await dummyTokenContract.allowance(deployer, masterChefV2Addr)
  // console.log("allowance:           ", allowance.toString());
  // await (await dummyTokenContract.connect(deployerSigner).approve(masterChefV2Addr, deadline)).wait()
  // allowance = await dummyTokenContract.allowance(deployer, masterChefV2Addr)
  // console.log("allowance:           ", allowance.toString());
  // await (await masterChefV2.connect(deployerSigner).init(dummyToken, txOptions)).wait()


  if (await masterChefV2.owner() === deployer) {
    console.log("Transfer ownership of MasterChefV2 to dev");
    await (await masterChefV2.connect(deployerSigner).transferOwnership(dev, true, false, txOptions)).wait()
    console.log("masterChefV2.owner(): ", (await masterChefV2.owner()));
  }
}

module.exports.tags = ["MasterChefV2"]
module.exports.dependencies = ["MasterChef"]
// module.exports.dependencies = ["UniswapV2Factory", "UniswapV2Router02", "SushiToken", "MasterChef"]
