import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToOne,
    JoinColumn
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Credential{
    @PrimaryGeneratedColumn()
    id: number

    @Column({name:'email',unique: true})
    email: string

    @Column({name:'password_hash'})
    password: string

    @OneToOne(type => User, user => user.credential, {cascade: true})
    @JoinColumn({name:'user_id'})
    user: User

    @CreateDateColumn({name:'created_at'})
    createdAt: Date

    @UpdateDateColumn({name:'updated_at'})
    updatedAt: Date
}