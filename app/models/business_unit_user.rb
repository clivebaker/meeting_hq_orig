class BusinessUnitUser < ApplicationRecord

  has_paper_trail

  belongs_to :user
  belongs_to :business_unit

  include Discard::Model

  scope :active, -> { where(discarded_at: nil) }
  scope :discarded, -> { where.not(discarded_at: nil) }

  delegate :name, to: :user, prefix: true



end
