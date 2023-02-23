import BaseNode from "@/layout/BaseNode";
import { CustomHandle } from "@/layout/CustomHandle";
import { createPDA } from "@/util/genratePDA";
import { Box, Flex, VStack } from "@chakra-ui/react";
import { createQR, encodeURL, TransferRequestURLFields } from "@solana/pay";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import BigNumber from "bignumber.js";
import React, { FC, useEffect, useMemo, useRef, useState } from "react";
import {
  Connection as RCon,
  NodeProps,
  useNodeId,
  useNodes,
  useReactFlow,
} from "reactflow";

const SolanaPay: FC<NodeProps> = (props) => {
  const [txid, setTxid] = useState<string | undefined>("");
  const [currentPDA, setCurrentPDA] = useState<string[]>([]);

  const qrRef = useRef<HTMLDivElement>(null)
  const reference = useMemo(() => Keypair.generate().publicKey, [])

  const { getNode, setNodes, getEdges } = useReactFlow();
  const nodeId = useNodeId();
  const nodes = useNodes();

  const currentNodeObj = nodes.find((node) => node.id == nodeId);

  const updateNodeData = (nodeId: string, data: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          node.data = {
            ...node.data,
            data,
          };
        }
        return node;
      })
    );
  };
  const updatePDA = (e: RCon) => {
    if (!e.target) return;
    updateNodeData(e.target, txid as string);
    setCurrentPDA([...currentPDA, e.target]);
  };
  useEffect(() => {
    currentPDA.forEach((target) =>
      updateNodeData(target, txid as string)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txid]);

  useEffect(() => {
    if (!nodeId) return;
    const currentNode = getNode(nodeId);
    let edge_id = Object();
    const edges = getEdges();
    edges.map((e) => {
      edge_id = {
        ...edge_id,
        [e.targetHandle as string]: e.source,
      };
    });

    const dataValues: string[] = Object.values(currentNode?.data);
    if (dataValues && dataValues.length) {
      const recipient = currentNode?.data[String(edge_id["recipient"])]
      const splToken = currentNode?.data[String(edge_id["spl_token"])]
      const amount = currentNode?.data[String(edge_id["amount"])]
      const label = currentNode?.data[String(edge_id["label"])] || "SOL Trek"
      const message = currentNode?.data[String(edge_id["message"])] || "Solana Pay QR generated using SOL Trek"


      if (!recipient || !splToken || !amount) return
      const urlParams: TransferRequestURLFields = {
        recipient: new PublicKey(recipient),
        splToken: new PublicKey(splToken),
        amount: BigNumber(amount),
        reference,
        label,
        message,
      }

      const url = encodeURL(urlParams)
      const qr = createQR(url, 200, '#1B192F', "white")
      if (qrRef.current && amount > 0) {
        qrRef.current.innerHTML = ''
        qr.append(qrRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentNodeObj?.data]);
  return (
    <>
      <BaseNode height="23rem" {...props} title="Solana Pay">
        <VStack>
          <CustomHandle
            pos="left"
            type="target"
            id="recipient"
            label="Recipient"
            style={{ marginTop: "-5.5rem" }}
          />
          <CustomHandle
            pos="left"
            type="target"
            id="spl_token"
            label="SPL Token"
            style={{ marginTop: "-2rem" }}
          />
          <CustomHandle
            pos="left"
            type="target"
            id="amount"
            label="Amount"
            style={{ marginTop: "1.5rem" }}
          />
          <CustomHandle
            pos="left"
            type="target"
            id="label"
            label="Label"
            style={{ marginTop: "5rem" }}
          />
          <CustomHandle
            pos="left"
            type="target"
            id="message"
            label="Message"
            style={{ marginTop: "8.5rem" }}
          />
        </VStack>
        <Flex
          align="center"
          justify="center"
          ml="6rem"
          mt="0.5rem"
          color="gray.100"
          borderRadius="2rem"
        >
          <Box sx={{ borderRadius: '2rem' }} ref={qrRef} />
        </Flex>
      </BaseNode>
    </>
  );
};

export default SolanaPay;