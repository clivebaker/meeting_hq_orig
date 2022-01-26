class Agenda < ApplicationRecord

  include AASM

  has_paper_trail

  belongs_to :meeting
  acts_as_list scope: :meeting

  validates_presence_of :name, on: [:update, :create], message: "can't be blank"

  delegate :name, to: :meeting, prefix: true

  default_scope { order(position: :asc)}
 
  aasm do
    state :active, initial: true
    state :future, :closed

    event :close do
      transitions from: [:future, :active], to: :closed
      after do
        remove_from_list
      end
      

    end

  end


end
