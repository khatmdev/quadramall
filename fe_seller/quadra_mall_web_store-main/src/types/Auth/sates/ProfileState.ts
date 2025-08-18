import type {UserDTO} from "@/types/dto/UserDTO.ts";

export interface ProfileState{
    user : UserDTO | null;
    loading: boolean;
    error : string | null;

}