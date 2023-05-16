import { Keypair, PublicKey } from "@solana/web3.js";
import dexterity from "@hxronetwork/dexterity-ts";
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";

export namespace HXRODexterity {

  export const createTRG = async (
    selectedNetwork: string,
    kp: Uint8Array,
  ) => {
    const wallet = new NodeWallet(Keypair.fromSecretKey(kp));
    try {
      const manifest = await dexterity.getManifest(selectedNetwork, false, wallet);

      const mpgs = Array.from(manifest.fields.mpgs.values());
      const selectedMPG = mpgs.map(
        (value) => value.pubkey,
      );
      const trgPubkey = await manifest.createTrg(selectedMPG[0]);
      return { res: trgPubkey.toBase58(), error: '' }

    } catch (e: any) {
      return { error: e.toString(), res: '' }
    }
  }


  export const viewTRGAccount = async (
    selectedNetwork: string,
    kp: Uint8Array,
    trgPubkey: PublicKey,
  ) => {
    try {
      const wallet = new NodeWallet(Keypair.fromSecretKey(kp));
      const manifest = await dexterity.getManifest(selectedNetwork, false, wallet);
      const trader = new dexterity.Trader(manifest, trgPubkey);
      let data: any = {}

      const viewAccount = async () => {
        data = {
          ...data,
          netCash: trader.getNetCash().toNumber(),
          pnl: trader.getPnL().toNumber(),
          totalWithdrawn: trader.getTotalWithdrawn().toNumber(),
          totalDeposited: trader.getTotalDeposited().toNumber()

        }

      };
      const account = async () => await trader.connect(NaN, viewAccount)
      await account()
      return { res: data, error: '' }
    } catch (e: any) {
      return { error: e.toString(), res: '' }
    }
  }

  export const depositAmount = async (
    selectedNetwork: string,
    kp: Uint8Array,
    trgPubkey: PublicKey,
    amount: number,
  ) => {
    const wallet = new NodeWallet(Keypair.fromSecretKey(kp));
    try {
      const manifest = await dexterity.getManifest(selectedNetwork, false, wallet);

      const trader = new dexterity.Trader(manifest, trgPubkey);
      let prevAmount = 0
      let newAmount = 0
      const viewAccount = async () => {
        const cash = trader.getNetCash().toNumber()
        if (prevAmount == 0) {
          prevAmount = cash
        } else {
          newAmount = cash
        }
      };
      const account = async () => await trader.connect(NaN, viewAccount)
      await account()
      await trader.deposit(dexterity.Fractional.New(amount, 0))
      await account()
      return { error: '', res: `Deposited ${amount}. Balance Change: ${prevAmount} -> ${newAmount}` }
    } catch (e: any) {
      return { error: e.toString(), res: '' }
    }
  }


  export const withdrawAmount = async (
    selectedNetwork: string,
    kp: Uint8Array,
    trgPubkey: PublicKey,
    amount: number,
  ) => {
    const wallet = new NodeWallet(Keypair.fromSecretKey(kp));
    try {
      const manifest = await dexterity.getManifest(selectedNetwork, false, wallet);

      const trader = new dexterity.Trader(manifest, trgPubkey);
      let prevAmount = 0
      let newAmount = 0
      const viewAccount = async () => {
        const cash = trader.getNetCash().toNumber()
        if (prevAmount == 0) {
          prevAmount = cash
        } else {
          newAmount = cash
        }
      };
      const account = async () => await trader.connect(NaN, viewAccount)
      await account()
      await trader.withdraw(dexterity.Fractional.New(amount, 0))
      await account()
      return { error: '', res: `Withdrawed ${amount}. Balance Change: ${prevAmount} -> ${newAmount}` }
    } catch (e: any) {
      return { error: e.toString(), res: '' }
    }
  }

  export const placeLimitOrder = async (
    selectedNetwork: string,
    type: "long" | "short",
    kp: Uint8Array,
    trgPubkey: PublicKey,
    productName: string,
    quote_size: number,
    price: number,
  ) => {
    const wallet = new NodeWallet(Keypair.fromSecretKey(kp));
    try {
      const manifest = await dexterity.getManifest(selectedNetwork, false, wallet);

      const trader = new dexterity.Trader(manifest, trgPubkey);

      const streamAccount = () => {
        console.log(
          'Portfolio Value:',
          trader.getPortfolioValue().toString(),
          'Position Value:',
          trader.getPositionValue().toString(),
          'Net Cash:',
          trader.getNetCash().toString(),
          'PnL:',
          trader.getPnL().toString()
        );
      };
      const account = async () => {
        await trader.connect(NaN, streamAccount);
      };

      await account()

      let perpIndex: any;
      for (const [name, { index }] of trader.getProducts()) {
        console.log('saw', name, ' ', index);
        if (name !== productName) {
          continue;
        }
        perpIndex = index;
        break;
      }
      await account()
      const QUOTE_SIZE = dexterity.Fractional.New(quote_size, 0);
      const dollars = dexterity.Fractional.New(price, 0);

      trader.newOrder(perpIndex, type == "long" ? true : false, dollars, QUOTE_SIZE).then(async () => {
        console.log(`Placed Buy Limit Order at $${dollars}`);
        await account();
      })
    } catch (e: any) {
      return { error: e.toString(), res: '' }
    }
  }


}