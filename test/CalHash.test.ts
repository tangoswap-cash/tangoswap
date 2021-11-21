import { expect } from "chai";
import { prepare, deploy, getBigNumber, createSLP } from "./utilities"
const { ethers: { constants: { MaxUint256 }}} = require("ethers")
import { keccak256 } from '@ethersproject/solidity'

describe("UniswapV2Router02", function () {
  before(async function () {
    await prepare(this, ["UniswapV2Pair"])
  })

  beforeEach(async function () {
    // await deploy(this, [
    //   ["sushi", this.ERC20Mock, ["SUSHI", "SUSHI", getBigNumber("10000000")]],
    //   ["dai", this.ERC20Mock, ["DAI", "DAI", getBigNumber("10000000")]],
    //   ["mic", this.ERC20Mock, ["MIC", "MIC", getBigNumber("10000000")]],
    //   ["usdc", this.ERC20Mock, ["USDC", "USDC", getBigNumber("10000000")]],
    //   ["weth", this.ERC20Mock, ["WETH", "ETH", getBigNumber("10000000")]],
    //   ["strudel", this.ERC20Mock, ["$TRDL", "$TRDL", getBigNumber("10000000")]],
    //   ["factory", this.UniswapV2Factory, [this.alice.address]],
    // ])

    // await deploy(this, [["router", this.UniswapV2Router02, [this.factory.address, this.weth.address]]])
    // // await deploy(this, [["bar", this.SushiBar, [this.sushi.address]]])
    // // await deploy(this, [["sushiMaker", this.SushiMaker, [this.factory.address, this.bar.address, this.sushi.address, this.weth.address]]])
    // // await deploy(this, [["exploiter", this.SushiMakerExploitMock, [this.sushiMaker.address]]])
    // await createSLP(this, "sushiEth", this.sushi, this.weth, getBigNumber(10))
    // await createSLP(this, "strudelEth", this.strudel, this.weth, getBigNumber(10))
    // await createSLP(this, "daiEth", this.dai, this.weth, getBigNumber(10))
    // await createSLP(this, "usdcEth", this.usdc, this.weth, getBigNumber(10))
    // await createSLP(this, "micUSDC", this.mic, this.usdc, getBigNumber(10))
    // await createSLP(this, "sushiUSDC", this.sushi, this.usdc, getBigNumber(10))
    // await createSLP(this, "daiUSDC", this.dai, this.usdc, getBigNumber(10))
    // await createSLP(this, "daiMIC", this.dai, this.mic, getBigNumber(10))
  })
  describe("COMPUTED_INIT_CODE_HASH", function () {
    it("tests COMPUTED_INIT_CODE_HASH", async function () {
      console.log("test COMPUTED_INIT_CODE_HASH");
      
      // console.log("this.UniswapV2Pair: ", this.UniswapV2Pair);

      const bytecode = this.UniswapV2Pair.bytecode;
      console.log("bytecode: ", bytecode);
      const COMPUTED_INIT_CODE_HASH = keccak256(['bytes'], [`${bytecode}`])
      console.log("COMPUTED_INIT_CODE_HASH: ", COMPUTED_INIT_CODE_HASH);

      // COMPUTED_INIT_CODE_HASH:  0x3a59375034df7e1d03dcf70e917f2cd9254c9dac547b1a0e6ef8accfe9267885
    })
  })
})
