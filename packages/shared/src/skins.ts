// Каталог скинов юнитов: каждой записи соответствует PNG с тем же именем
// (без расширения) в apps/web/static/skins/. id = uuid, как в units.skin_uuid.
import type { UnitRarity } from './units';

export type Skin = {
  id: string;
  rarity: UnitRarity;
};

export const SKINS: readonly Skin[] = [
  { id: 'e01f7d44-58ad-445d-8da7-3c746eb1aede', rarity: 'base' }, // 01.png
  { id: 'e01f7d44-58ad-445d-8da7-3c746eb1aede', rarity: 'uncommon' }, // 01.png
  { id: '1611109a-3885-4cf7-87cc-8fb2a7f5227b', rarity: 'base' }, // 02.png
  { id: '1611109a-3885-4cf7-87cc-8fb2a7f5227b', rarity: 'uncommon' }, // 02.png
  { id: '0752ff3c-0c7d-4f0d-972f-8499e599aaf8', rarity: 'base' }, // 021.png
  { id: '0752ff3c-0c7d-4f0d-972f-8499e599aaf8', rarity: 'uncommon' }, // 021.png
  { id: '9efd4e6c-3157-432d-aea3-6b18ba0bb11f', rarity: 'base' }, // 03.png
  { id: '9efd4e6c-3157-432d-aea3-6b18ba0bb11f', rarity: 'uncommon' }, // 03.png
  { id: '30d087c7-0af3-423b-ad5b-c4357b9de879', rarity: 'base' }, // 04.png
  { id: '30d087c7-0af3-423b-ad5b-c4357b9de879', rarity: 'uncommon' }, // 04.png
  { id: '842f3cd6-a202-4233-8ae4-65459cce9a39', rarity: 'base' }, // 05.png
  { id: '842f3cd6-a202-4233-8ae4-65459cce9a39', rarity: 'uncommon' }, // 05.png
  { id: '3ce7a5be-b427-4c1e-877d-ad0d5ff35410', rarity: 'base' }, // 06.png
  { id: '3ce7a5be-b427-4c1e-877d-ad0d5ff35410', rarity: 'uncommon' }, // 06.png
  { id: 'd35de863-7ad4-4d3b-90c0-a1c6cda4d93e', rarity: 'base' }, // 07.png
  { id: 'd35de863-7ad4-4d3b-90c0-a1c6cda4d93e', rarity: 'uncommon' }, // 07.png
  { id: '59dbfe87-b564-44f5-9fd9-4f74127082aa', rarity: 'base' }, // 08.png
  { id: '59dbfe87-b564-44f5-9fd9-4f74127082aa', rarity: 'uncommon' }, // 08.png
  { id: 'b378dc25-b443-4d46-838c-51765b3c8064', rarity: 'base' }, // 09.png
  { id: 'b378dc25-b443-4d46-838c-51765b3c8064', rarity: 'uncommon' }, // 09.png
  { id: '19eb76d8-f6ce-452b-9a98-40c49b6721cd', rarity: 'base' }, // 10.png
  { id: '19eb76d8-f6ce-452b-9a98-40c49b6721cd', rarity: 'uncommon' }, // 10.png
  { id: '910fb058-93e4-45d4-a831-6a183a34c7af', rarity: 'base' }, // 11.png
  { id: '910fb058-93e4-45d4-a831-6a183a34c7af', rarity: 'uncommon' }, // 11.png
  { id: '0634741e-ff2c-4636-858d-59d12ab5d241', rarity: 'base' }, // 12.png
  { id: '0634741e-ff2c-4636-858d-59d12ab5d241', rarity: 'uncommon' }, // 12.png
  { id: 'e1ee347f-d1c3-4e0b-81e0-3b5c17d2de1b', rarity: 'base' }, // 13.png
  { id: 'e1ee347f-d1c3-4e0b-81e0-3b5c17d2de1b', rarity: 'uncommon' }, // 13.png
  { id: '6a16d4cc-cf7c-4739-ae54-5bb74aca4ef4', rarity: 'base' }, // 14.png
  { id: '6a16d4cc-cf7c-4739-ae54-5bb74aca4ef4', rarity: 'uncommon' }, // 14.png
  { id: 'd0234633-7996-483c-91a3-1749b58c9a63', rarity: 'base' }, // 15.png
  { id: 'd0234633-7996-483c-91a3-1749b58c9a63', rarity: 'uncommon' }, // 15.png
  { id: '00f50684-07fd-4d75-9414-cf4d68d5907d', rarity: 'base' }, // 16.png
  { id: '00f50684-07fd-4d75-9414-cf4d68d5907d', rarity: 'uncommon' }, // 16.png
  { id: '21ef69c6-3800-4fd2-a001-51ba551b6d47', rarity: 'base' }, // 17.png
  { id: '21ef69c6-3800-4fd2-a001-51ba551b6d47', rarity: 'uncommon' }, // 17.png
  { id: 'e2aa2024-aa1a-4222-95b5-72c390c5bcf1', rarity: 'base' }, // 18.png
  { id: 'e2aa2024-aa1a-4222-95b5-72c390c5bcf1', rarity: 'uncommon' }, // 18.png
  { id: '31115c23-16ed-491a-9624-5448f5dc2992', rarity: 'uncommon' }, // 19.png
  { id: '84cd9f5e-37c5-4855-9cbf-36087d835ba8', rarity: 'base' }, // 20.png
  { id: '08d17b6d-2c13-4fce-ac8b-fc1292b72567', rarity: 'base' }, // colour (1).png
  { id: '28a4c064-1d83-4a02-86f5-1b390075c78a', rarity: 'base' }, // colour (10).png
  { id: '2ed8609c-860f-4bf7-8ee4-4d3279bcef65', rarity: 'base' }, // colour (100).png
  { id: '8b0fba47-7775-4ad8-80be-54b8ecaf1fc9', rarity: 'base' }, // colour (101).png
  { id: 'd3e6606d-ea37-4a05-ab14-4305474adc85', rarity: 'base' }, // colour (102).png
  { id: '30031df4-7d12-433b-95cf-45052bc484d0', rarity: 'base' }, // colour (103).png
  { id: '87db9e57-0851-4b49-8992-230bcbc32c47', rarity: 'base' }, // colour (104).png
  { id: '30e4d25a-83f2-46a7-b665-def3284cc782', rarity: 'base' }, // colour (105).png
  { id: '01e257d5-14d4-4c45-bb36-1dc1a1f0a152', rarity: 'base' }, // colour (106).png
  { id: '03748f15-ce09-4d4d-b30f-7beb9e1d6b4a', rarity: 'base' }, // colour (11).png
  { id: '934a9c31-ffbe-4b9c-9cb8-c7ebb224c4c2', rarity: 'base' }, // colour (12).png
  { id: '6e9c3e5e-0e8b-4c4e-9d0e-03836e4b0daf', rarity: 'base' }, // colour (13).png
  { id: 'fbf9d79e-4243-4b79-a45b-82c117dc786b', rarity: 'base' }, // colour (14).png
  { id: 'bb26037d-b986-4a11-93dc-0fe02712873d', rarity: 'base' }, // colour (15).png
  { id: '214c8ad7-4673-4b09-a4dd-c4a276fbe958', rarity: 'base' }, // colour (16).png
  { id: '2ca15d97-d217-41e8-973c-f883e457351b', rarity: 'base' }, // colour (17).png
  { id: '797d2d6e-700b-4695-9b14-f4bdc9c3d500', rarity: 'base' }, // colour (18).png
  { id: 'ae9ad68e-54b4-4f56-af76-35e89ae11db6', rarity: 'base' }, // colour (19).png
  { id: 'fc4a2a32-4d97-439f-9bbc-395411882a01', rarity: 'base' }, // colour (2).png
  { id: '161c1901-1c12-425d-aebf-f03ededc8919', rarity: 'base' }, // colour (20).png
  { id: 'd0e9a3d1-6e39-4ffe-959d-c6a4929a15ea', rarity: 'base' }, // colour (21).png
  { id: '31f8be4f-6ee8-47d4-8723-68103f66a711', rarity: 'base' }, // colour (22).png
  { id: '98bf3235-279a-46ab-a57e-d82e3082bf98', rarity: 'base' }, // colour (23).png
  { id: 'fb2c917a-a844-4c9d-8634-2a3d9770581a', rarity: 'base' }, // colour (24).png
  { id: '6578f23d-b9c9-42da-87b3-59cd4716bde4', rarity: 'base' }, // colour (25).png
  { id: 'a72763b1-bfe4-4b27-99e1-e7e70ee66392', rarity: 'base' }, // colour (26).png
  { id: '0f1f311f-57b3-4920-b031-1cf20d8ca48f', rarity: 'base' }, // colour (27).png
  { id: 'c25d9430-08a3-4a58-92d3-e2f1510d72b3', rarity: 'uncommon' }, // colour (28).png
  { id: '3fbf6390-f508-4efd-bed7-3fb92fa386d2', rarity: 'uncommon' }, // colour (29).png
  { id: 'a476a9c5-5c83-4d87-a812-586e31046379', rarity: 'base' }, // colour (3).png
  { id: 'cfb7842a-e6dd-4f31-ac8c-e72ac8b2ae2a', rarity: 'base' }, // colour (30).png
  { id: '4cb4c255-5e04-4af8-ade7-1abea58f1df2', rarity: 'base' }, // colour (31).png
  { id: 'd04f03b4-c2d3-4bcf-94ad-68bf2db64d2f', rarity: 'base' }, // colour (32).png
  { id: '8db0501e-45c9-4961-87f2-9ae7b779aa3d', rarity: 'uncommon' }, // colour (33).png
  { id: '62d17bac-00e8-469a-ab11-b4e720499cc8', rarity: 'base' }, // colour (34).png
  { id: '3752b645-990f-4f68-babe-e8bb8c438c00', rarity: 'base' }, // colour (35).png
  { id: 'a57e7397-895a-4945-9a48-96aab8bb0091', rarity: 'base' }, // colour (36).png
  { id: '8959cf49-e69e-44be-9135-a55d2ba85044', rarity: 'base' }, // colour (37).png
  { id: '8d6f1734-081f-4f5d-9573-bcffd2829868', rarity: 'base' }, // colour (38).png
  { id: '10312c1f-d22e-4834-a683-8b83d566d4bc', rarity: 'base' }, // colour (39).png
  { id: '446bad6f-28b5-4ad4-845b-eac411bae181', rarity: 'base' }, // colour (4).png
  { id: '2ab27fad-c8f9-468c-a00a-6687dbc4b599', rarity: 'rare' }, // colour (40).png
  { id: '528fae08-ce2e-4d55-b17b-b08707a52347', rarity: 'rare' }, // colour (41).png
  { id: 'b12b0ad2-38c7-47ba-81f2-46887b8cf226', rarity: 'base' }, // colour (42).png
  { id: '3ed6a7c6-c8b5-445f-b366-4bd34b02e705', rarity: 'base' }, // colour (43).png
  { id: '8e5dbe5e-8be9-49bf-b012-061fa3b73153', rarity: 'base' }, // colour (44).png
  { id: '1629835a-1710-482c-84b6-e8a32b488c41', rarity: 'base' }, // colour (45).png
  { id: '6fbc06cd-c42f-4229-919d-3ebace23e9e8', rarity: 'base' }, // colour (46).png
  { id: '4a992112-b653-4755-926c-3f8522fb0170', rarity: 'base' }, // colour (47).png
  { id: '172c0424-1f42-424d-8192-8d654f386949', rarity: 'base' }, // colour (48).png
  { id: 'ded30c18-a07f-4a42-bd7e-fb68c55d7bac', rarity: 'uncommon' }, // colour (49).png
  { id: 'aa896365-0491-46a3-8b33-1f21011fa11e', rarity: 'base' }, // colour (5).png
  { id: 'a20c09be-cb40-4284-a1ea-a666c07b9356', rarity: 'base' }, // colour (50).png
  { id: 'b62a9637-819c-4c12-9b2c-63a5f99bca0d', rarity: 'base' }, // colour (51).png
  { id: 'af6717b8-30b2-46bd-b908-29c2443b0a5a', rarity: 'base' }, // colour (52).png
  { id: '55c6ab51-503c-4f08-a4d3-eed559deecdd', rarity: 'base' }, // colour (53).png
  { id: '195bc643-3e81-4fd5-8d58-b5be652fe00a', rarity: 'base' }, // colour (54).png
  { id: '731c03c8-fded-47d9-ae04-94410db2770b', rarity: 'base' }, // colour (55).png
  { id: '3ffd502c-1177-4737-b670-401217a9987e', rarity: 'base' }, // colour (56).png
  { id: 'dbde2c8a-7e7f-4c7d-8eb4-ead8fb1f30de', rarity: 'base' }, // colour (57).png
  { id: '75895a67-db87-47ad-b597-81379c82c469', rarity: 'base' }, // colour (58).png
  { id: '7ba8a24c-0a6f-429d-809c-3867072d50c2', rarity: 'uncommon' }, // colour (59).png
  { id: '934edf45-e88e-4fdc-bdf8-2d70e5520566', rarity: 'base' }, // colour (6).png
  { id: '1ca47dcf-8987-4b31-a01d-fa2567346192', rarity: 'base' }, // colour (60).png
  { id: 'c1d7f798-bacc-4b6c-90a2-9587133d71b7', rarity: 'base' }, // colour (61).png
  { id: 'c88384b8-e515-4356-8677-40658e08715b', rarity: 'base' }, // colour (62).png
  { id: '0bf85db1-48eb-47dd-964a-9b8f49c0c03a', rarity: 'base' }, // colour (63).png
  { id: 'c0a07018-e264-4a01-94ba-2d94be1f7cf0', rarity: 'base' }, // colour (64).png
  { id: '954bf800-4227-4d31-a2c0-76799a4d3fe1', rarity: 'base' }, // colour (65).png
  { id: '18325892-f835-4f4e-8943-c6133f19c30d', rarity: 'base' }, // colour (66).png
  { id: '079e216e-ffb7-44f2-a393-aabac665feca', rarity: 'base' }, // colour (67).png
  { id: 'ee575ccd-9b57-416f-a844-b44434a1f4a0', rarity: 'base' }, // colour (68).png
  { id: '68fe2b1f-63df-4c20-98f8-6ef8a5ff30ec', rarity: 'base' }, // colour (69).png
  { id: '9037696d-0c63-4a51-8360-5ea9a0cfa06a', rarity: 'base' }, // colour (7).png
  { id: 'b52d8e46-97e8-4d6a-8c57-716f20e19811', rarity: 'base' }, // colour (70).png
  { id: 'ec458b0d-1814-455f-974f-e520c3f68094', rarity: 'base' }, // colour (71).png
  { id: 'a91793ac-634a-4b93-9602-5ac9e1527a89', rarity: 'base' }, // colour (72).png
  { id: 'd5fd3394-1408-46f5-b99c-4e0d9de7829f', rarity: 'base' }, // colour (73).png
  { id: '8f241153-4ac2-4ee1-bce3-6ff69e930f3c', rarity: 'base' }, // colour (74).png
  { id: 'eccf8499-02c2-4d97-ae14-4ede12a068f3', rarity: 'base' }, // colour (75).png
  { id: '3c56de53-1449-4fe7-822d-2666f340c573', rarity: 'base' }, // colour (76).png
  { id: 'af8588bc-4e38-4523-9f05-57600100af6c', rarity: 'base' }, // colour (77).png
  { id: 'df61d777-956c-4ade-ad31-8c933db623d0', rarity: 'base' }, // colour (78).png
  { id: '1a985901-6f44-4e2a-b919-f45bb1407cd9', rarity: 'base' }, // colour (79).png
  { id: 'cd5abf07-a20c-4bf0-a02a-6c35255ec8c4', rarity: 'base' }, // colour (8).png
  { id: '4280cfe1-e18a-488c-95b7-580fd90f9924', rarity: 'base' }, // colour (80).png
  { id: 'b1410a42-f3b5-47e6-9ed6-4126325eb3e0', rarity: 'base' }, // colour (81).png
  { id: '5b15dbaf-9663-4680-bf01-710464fa72f9', rarity: 'base' }, // colour (82).png
  { id: '3b3ae193-b0d3-4087-9435-0b99977500f2', rarity: 'base' }, // colour (83).png
  { id: 'c93b729e-6e1b-4382-88ce-1101c8a98848', rarity: 'base' }, // colour (84).png
  { id: '62084023-2072-42dc-9fde-974ab1d80524', rarity: 'base' }, // colour (85).png
  { id: '82d02006-9a99-4f7f-bdf1-f092a22645d1', rarity: 'base' }, // colour (86).png
  { id: 'bc759bdc-b088-401e-a349-753a3d375ded', rarity: 'base' }, // colour (87).png
  { id: '9a756ee6-054a-43c5-9ced-fc2c7b679b02', rarity: 'base' }, // colour (88).png
  { id: 'eb96e4d1-d3e1-4d62-9b8a-215708c1c828', rarity: 'base' }, // colour (89).png
  { id: 'ce6d8545-0a0d-4730-851f-b994d2ad6a4f', rarity: 'base' }, // colour (9).png
  { id: 'a1e866ac-3946-4d28-b0fe-97ec9f4737e7', rarity: 'base' }, // colour (90).png
  { id: 'baa4de87-5659-4bab-8ff4-7ed4cad31a77', rarity: 'base' }, // colour (91).png
  { id: '12b66661-1f0e-4182-8442-986484410b31', rarity: 'base' }, // colour (92).png
  { id: 'd8c95ec4-c09b-4217-ab37-e7c8b5db5a64', rarity: 'base' }, // colour (93).png
  { id: '52b45d92-f3c6-4c22-9253-30a4d15aeced', rarity: 'base' }, // colour (94).png
  { id: '7a9b74a5-96af-4ec3-a9cd-715b5b281fa1', rarity: 'base' }, // colour (95).png
  { id: '12a153ad-a0cc-4ed4-967d-49bf81f22b37', rarity: 'base' }, // colour (96).png
  { id: 'fb8af0e3-fea5-4479-9aac-cb98f4e91040', rarity: 'base' }, // colour (97).png
  { id: 'c8c49025-9605-441d-9257-4ce4ec073cf2', rarity: 'base' }, // colour (98).png
  { id: '978729d1-6568-4a95-84e5-99f1e3caed9d', rarity: 'base' }, // colour (99).png
  { id: '2f07cdd5-db0f-4676-8204-088f29360b80', rarity: 'base' }, // colour_new year (1).png
  { id: '16e06dc6-1378-442b-b3df-9910736d80d2', rarity: 'base' }, // colour_new year (10).png
  { id: '1b33ebe8-87c9-4a67-9bc3-caa7ba4bee6d', rarity: 'epic' }, // colour_new year (11).png
  { id: '28052703-c384-404d-9b2e-4333d6f89432', rarity: 'epic' }, // colour_new year (12).png
  { id: '8a158d84-6716-462e-a0b1-2c1246de5093', rarity: 'rare' }, // colour_new year (13).png
  { id: 'e896c299-07cd-4716-890b-fdf698c2310b', rarity: 'rare' }, // colour_new year (14).png
  { id: 'ef488c88-dd2a-44cd-b1ce-1b090a4a44c5', rarity: 'rare' }, // colour_new year (15).png
  { id: '058a0472-2bd4-4162-9aa6-865b68d05271', rarity: 'rare' }, // colour_new year (16).png
  { id: '38876f24-f592-4d27-9d9a-b885f4d7321b', rarity: 'uncommon' }, // colour_new year (17).png
  { id: '5f8ec22f-d744-457e-bf43-c14333fbb005', rarity: 'uncommon' }, // colour_new year (18).png
  { id: '01ed8558-7fa4-47be-8dc3-9ca44a4271d7', rarity: 'epic' }, // colour_new year (19).png
  { id: 'f9d2533d-2314-4915-822e-51cbe334096c', rarity: 'base' }, // colour_new year (2).png
  { id: '348500f1-df55-4c4f-88bd-dca6f30f3601', rarity: 'epic' }, // colour_new year (20).png
  { id: '39189ad3-71a9-4fe1-ad54-d0cde1826cd2', rarity: 'base' }, // colour_new year (21).png
  { id: 'f2639e26-23f9-4ec9-b82d-2fee8446027d', rarity: 'base' }, // colour_new year (22).png
  { id: '76245097-3d4c-4aff-a076-c9f9a40fb237', rarity: 'base' }, // colour_new year (23).png
  { id: '84192e88-8710-4c82-831e-dc81efa20841', rarity: 'base' }, // colour_new year (24).png
  { id: '381668f2-5a59-4db5-b8e2-696b561520c2', rarity: 'base' }, // colour_new year (3).png
  { id: '1bfbba70-6420-4c21-8374-c9e193fbfa83', rarity: 'base' }, // colour_new year (4).png
  { id: 'f0c2a1b9-90f3-4598-b5de-159d32393615', rarity: 'base' }, // colour_new year (5).png
  { id: 'cdd71693-9a8a-4427-93ce-58d6dc168fc4', rarity: 'base' }, // colour_new year (6).png
  { id: '1ea17dbe-44e5-4bac-ab65-1b7846c41acb', rarity: 'base' }, // colour_new year (7).png
  { id: 'a8273dc3-5f52-4cf9-af05-2fe4685db72b', rarity: 'base' }, // colour_new year (8).png
  { id: 'b64d0831-c782-4eba-aba9-6a1e272032bc', rarity: 'base' }, // colour_new year (9).png
  { id: 'dfbbacf0-41b8-4b72-bfb2-a9e96e52a92e', rarity: 'base' }, // new year (1).png
  { id: '0638ced0-78de-47c7-88c4-f9aa45d65a4d', rarity: 'epic' }, // new year (10).png
  { id: 'bde28513-c593-43dc-a216-bef6a829e6b2', rarity: 'base' }, // new year (11).png
  { id: 'afe13e98-b4a6-4dfc-b2eb-9460275754fc', rarity: 'base' }, // new year (12).png
  { id: 'cbd6e2f6-4d53-4b3e-98b3-b2e0520db137', rarity: 'base' }, // new year (2).png
  { id: '86d9a65a-1323-4ecd-b187-20ff911b7052', rarity: 'base' }, // new year (3).png
  { id: '3885d420-7993-4b00-afab-61a3f5327029', rarity: 'base' }, // new year (4).png
  { id: '37fc1e9c-9c02-4863-9eb5-149d0585d295', rarity: 'base' }, // new year (5).png
  { id: 'fa373141-36ff-408d-91a1-2fe00a2e9f4e', rarity: 'rare' }, // new year (6).png
  { id: 'ff3e44ef-ef39-4f4c-80db-0087e963cdd3', rarity: 'rare' }, // new year (7).png
  { id: 'b93be083-3991-4ef3-8031-874626fbb55e', rarity: 'rare' }, // new year (8).png
  { id: '6ceaf5ed-f28f-4b8f-a82e-2be464db9fea', rarity: 'base' }, // new year (9).png
  { id: '18c697c7-307c-46c4-b11b-522171c57386', rarity: 'base' }, // skin_2pac.png
  { id: '71b7eb1c-036f-466a-9702-da52dd533e3b', rarity: 'base' }, // skin_3d_moviegoer.png
  { id: '4f688279-722a-4f2a-8e84-5bef0ee98000', rarity: 'epic' }, // skin_astronaut.png
  { id: 'f2881d24-9ee2-446e-976d-a5c6bbae4ec8', rarity: 'base' }, // skin_autumn_scarf.png
  { id: '585176ba-01e0-42dd-8e53-044e03082902', rarity: 'base' }, // skin_aviator.png
  { id: 'd60f30e4-53c3-4b93-a635-e29277c0b79a', rarity: 'base' }, // skin_avocado_hipster.png
  { id: 'bc24f764-b20b-481f-b610-f1ca0203a722', rarity: 'base' }, // skin_beekeeper.png
  { id: '194f020e-1452-48f9-acff-37a21cfe3d91', rarity: 'base' }, // skin_bob_marley.png
  { id: '786695fc-fd3b-47e3-b76a-ec0b4d6edf10', rarity: 'base' }, // skin_builder.png
  { id: '761c9a92-e4cc-43d5-96ea-18245dd7867f', rarity: 'base' }, // skin_burger_chameleon.png
  { id: 'b88c7f9b-6702-414b-8eb3-9ad9bfe67457', rarity: 'base' }, // skin_coffee_hipster.png
  { id: '7a7125ac-d5ce-48f1-b06e-660fb4539a4f', rarity: 'uncommon' }, // skin_crypto_king.png
  { id: '89604ed7-ef50-4ec5-8160-1104e73155b2', rarity: 'base' }, // skin_dragonfruit_lover.png
  { id: '90efcd0b-1b8f-4c4c-9516-f0aaaed3d095', rarity: 'base' }, // skin_drone_pilot.png
  { id: 'fd53de00-a962-4348-98d1-80f81e3f17b2', rarity: 'rare' }, // skin_einstein.png
  { id: '22f1a464-24a1-4a23-866f-095d48859f5f', rarity: 'epic' }, // skin_elvis.png
  { id: 'cad65d9a-9de6-42e0-a2e6-d653e478d208', rarity: 'base' }, // skin_fifth_element.png
  { id: 'f0a76818-473d-4f7e-ba4e-3126d56caf1b', rarity: 'epic' }, // skin_freddie_mercury.png
  { id: '8a4e5599-3938-46d8-aac3-70a6259c67da', rarity: 'epic' }, // skin_jack_sparrow.png
  { id: '7ce2e23f-bf79-4ecb-8f97-4556dffdb417', rarity: 'base' }, // skin_king.png
  { id: '656969f6-ff07-493e-9c65-e548d8258ec2', rarity: 'rare' }, // skin_matrix.png
  { id: 'b28270a2-a614-48f5-a79a-239f4ded8b72', rarity: 'epic' }, // skin_michael_jackson.png
  { id: 'a414cd6f-62d4-47a8-8268-a2e608d1713b', rarity: 'base' }, // skin_mojito_crab.png
  { id: '14428b5d-ae1c-4b46-acec-4c885a114021', rarity: 'legendary' }, // skin_napoleon.png
  { id: 'bb780729-4b35-4d41-ac72-2cd879de91e7', rarity: 'base' }, // skin_peaky_blinder.png
  { id: '42027c13-cea2-4fd7-8dd6-758a2ee40ec3', rarity: 'base' }, // skin_punk_rocker.png
  { id: 'fca5d635-bad0-4c6d-b2ae-7bad9efe224b', rarity: 'base' }, // skin_rockstar.png
  { id: '80ce0f57-7222-43b3-b01c-30cd51a9d3cc', rarity: 'base' }, // skin_roman_emperor.png
  { id: '3f7eb51f-5cb9-4256-854f-4682a214a59b', rarity: 'base' }, // skin_safari_explorer.png
  { id: '77fbae45-dc69-477a-8a67-ce9b441f5d3d', rarity: 'base' }, // skin_scientist.png
  { id: 'a908958e-9273-42c9-882c-be32d59ac055', rarity: 'legendary' }, // skin_scorpion.png
  { id: '6247c0a8-cd87-40df-87fe-a73854ad22bd', rarity: 'base' }, // skin_sheriff.png
  { id: '55874051-0a2a-4561-acf2-23ae8e96445d', rarity: 'base' }, // skin_skateboarder.png
  { id: '3ba0ae99-7cef-4318-9941-f2c787d64bd5', rarity: 'base' }, // skin_skater.png
  { id: '992fa04b-1416-4168-a2c7-3ba2f75a6020', rarity: 'base' }, // skin_snoop_dogg.png
  { id: '3099d61c-14df-47a7-8417-c11440a8cb36', rarity: 'base' }, // skin_sweet_snail.png
  { id: '605aaf3e-1814-4f4f-bde3-54d1d19d9131', rarity: 'base' }, // skin_the_weeknd.png
  { id: '380386b0-d7f9-4df2-9cb8-c7727b5506d4', rarity: 'base' }, // skin_tourist_friend.png
  { id: '5561fee0-412e-4ef6-9409-44b1afebe1de', rarity: 'legendary' }, // skin_tyson.png
  { id: '3525b2f5-6aff-4aca-8585-6e94f8124996', rarity: 'base' } // skin_viking.png
];

/** Random skin id of the given rarity from the catalog; null if none exist. */
export const getRandomSkinId = (rarity: UnitRarity): string | null => {
  const pool = SKINS.filter((s) => s.rarity === rarity);
  return pool[Math.floor(Math.random() * pool.length)]?.id ?? null;
};
