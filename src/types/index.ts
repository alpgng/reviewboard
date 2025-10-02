export type Status = "NEW" | "IN_REVIEW" | "APPROVED" | "REJECTED";


export type ItemDTO = {
id: string;
title: string;
description: string;
amount: number;
tags: string[];
risk_score: number;
status: Status;
createdAt: string;
updatedAt: string;
};