import React from "react";
import { Separator } from "../ui/separator";
import Image from "next/image";
import DefaultPfp from "../DefaultPfp";

interface SelfProps {
  pfpUrl?: string;
  pushname: string;
  isMe?: boolean;
  isGroup?: boolean;
  phoneNumber: string;
  isAdmin?: boolean;
}

export default function UserProfile(props: SelfProps) {
  return (
    <>
      <div className="flex items-center justify-between pr-4">
        <div className="hidden md:flex items-center space-x-4">
          {props.pfpUrl ? (
            <Image
              className="flex aspect-square size-8 items-center justify-center rounded-lg"
              height={64}
              width={64}
              alt="Pfp"
              src={props.pfpUrl}
            />
          ) : (
            <DefaultPfp />
          )}
          <span>{props.pushname}</span>
          <p className="text-sm text-muted-foreground">{`${
            props.isGroup ? "" : "+"
          }${props.phoneNumber}`}</p>
        </div>
        <div className="flex md:hidden items-center space-x-4">
          {props.pfpUrl ? (
            <Image
              className="flex aspect-square size-8 items-center justify-center rounded-lg"
              height={64}
              width={64}
              alt="Pfp"
              src={props.pfpUrl}
            />
          ) : (
            <DefaultPfp />
          )}
          <div className="flex flex-col">
            <span>{props.pushname}</span>
            <p className="text-sm text-muted-foreground">{`${
              props.isGroup ? "" : "+"
            }${props.phoneNumber}`}</p>
          </div>
        </div>
        {props.isAdmin ? <p className="text-green-500">Admin</p> : <></>}
        {props.isMe ? <p className="text-green-500">Bot</p> : <></>}
      </div>
      <Separator />
    </>
  );
}
