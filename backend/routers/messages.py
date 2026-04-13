from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from db.database import get_db, User
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from db.database import Base
from routers.auth import get_current_user

router = APIRouter(prefix="/messages", tags=["messages"])


# ─── Models ──────────────────────────────────────────────────────────────────

class Conversation(Base):
    __tablename__ = "conversations"
    id = Column(Integer, primary_key=True, index=True)
    user_a_id = Column(Integer, ForeignKey("users.id"))
    user_b_id = Column(Integer, ForeignKey("users.id"))
    last_message = Column(Text, nullable=True)
    last_message_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Message(Base):
    __tablename__ = "messages"
    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"))
    sender_id = Column(Integer, ForeignKey("users.id"))
    content = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


# ─── Schemas ─────────────────────────────────────────────────────────────────

class StartConversation(BaseModel):
    recipient_id: int


class SendMessage(BaseModel):
    content: str


# ─── Endpoints ───────────────────────────────────────────────────────────────

@router.get("/users")
def list_messageable_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return all users except self for starting new conversations."""
    users = (
        db.query(User)
        .filter(User.id != current_user.id, User.is_active == True)
        .order_by(User.full_name)
        .all()
    )
    return [
        {"id": u.id, "full_name": u.full_name, "role": u.role}
        for u in users
    ]


@router.get("/conversations")
def list_conversations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    convos = (
        db.query(Conversation)
        .filter(
            or_(
                Conversation.user_a_id == current_user.id,
                Conversation.user_b_id == current_user.id,
            )
        )
        .order_by(desc(Conversation.last_message_at))
        .all()
    )

    result = []
    for c in convos:
        other_id = c.user_b_id if c.user_a_id == current_user.id else c.user_a_id
        other_user = db.query(User).filter(User.id == other_id).first()

        unread = (
            db.query(Message)
            .filter(
                Message.conversation_id == c.id,
                Message.sender_id != current_user.id,
                Message.is_read == False,
            )
            .count()
        )

        result.append(
            {
                "id": c.id,
                "other_user_name": other_user.full_name if other_user else "Unknown",
                "other_user_role": other_user.role if other_user else "",
                "last_message": c.last_message,
                "last_message_at": c.last_message_at,
                "unread_count": unread,
            }
        )

    return result


@router.post("/conversations/start")
def start_conversation(
    body: StartConversation,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if body.recipient_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot message yourself")

    recipient = db.query(User).filter(User.id == body.recipient_id).first()
    if not recipient:
        raise HTTPException(status_code=404, detail="User not found")

    # Check if conversation already exists
    existing = (
        db.query(Conversation)
        .filter(
            or_(
                and_(
                    Conversation.user_a_id == current_user.id,
                    Conversation.user_b_id == body.recipient_id,
                ),
                and_(
                    Conversation.user_a_id == body.recipient_id,
                    Conversation.user_b_id == current_user.id,
                ),
            )
        )
        .first()
    )

    if existing:
        return {
            "id": existing.id,
            "other_user_name": recipient.full_name,
            "other_user_role": recipient.role,
            "last_message": existing.last_message,
            "last_message_at": existing.last_message_at,
            "unread_count": 0,
        }

    convo = Conversation(
        user_a_id=current_user.id,
        user_b_id=body.recipient_id,
    )
    db.add(convo)
    db.commit()
    db.refresh(convo)

    return {
        "id": convo.id,
        "other_user_name": recipient.full_name,
        "other_user_role": recipient.role,
        "last_message": None,
        "last_message_at": None,
        "unread_count": 0,
    }


@router.get("/conversations/{conversation_id}")
def get_messages(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    convo = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not convo:
        raise HTTPException(status_code=404, detail="Conversation not found")

    if current_user.id not in [convo.user_a_id, convo.user_b_id]:
        raise HTTPException(status_code=403, detail="Access denied")

    # Mark incoming messages as read
    db.query(Message).filter(
        Message.conversation_id == conversation_id,
        Message.sender_id != current_user.id,
        Message.is_read == False,
    ).update({"is_read": True})
    db.commit()

    messages = (
        db.query(Message)
        .filter(Message.conversation_id == conversation_id)
        .order_by(Message.created_at)
        .all()
    )

    result = []
    for m in messages:
        sender = db.query(User).filter(User.id == m.sender_id).first()
        result.append(
            {
                "id": m.id,
                "content": m.content,
                "sender_id": m.sender_id,
                "sender_name": sender.full_name if sender else "Unknown",
                "is_own": m.sender_id == current_user.id,
                "is_read": m.is_read,
                "created_at": m.created_at,
            }
        )

    return result


@router.post("/conversations/{conversation_id}/send")
def send_message(
    conversation_id: int,
    body: SendMessage,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    convo = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not convo:
        raise HTTPException(status_code=404, detail="Conversation not found")

    if current_user.id not in [convo.user_a_id, convo.user_b_id]:
        raise HTTPException(status_code=403, detail="Access denied")

    if not body.content.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    msg = Message(
        conversation_id=conversation_id,
        sender_id=current_user.id,
        content=body.content.strip(),
    )
    db.add(msg)

    # Update conversation preview
    convo.last_message = body.content.strip()[:100]
    convo.last_message_at = datetime.utcnow()

    db.commit()
    db.refresh(msg)

    sender = db.query(User).filter(User.id == current_user.id).first()

    return {
        "id": msg.id,
        "content": msg.content,
        "sender_id": msg.sender_id,
        "sender_name": sender.full_name if sender else "Unknown",
        "is_own": True,
        "is_read": False,
        "created_at": msg.created_at,
    }